// DROPDOWN

var selectDiv = document.getElementById("selDataset");

Plotly.d3.json("/names", function(error, response) {
    if(error) return console.warn(error);
    var bb_ids = response;
    for (var i = 0; i < bb_ids.length; i++) {
        var option = document.createElement("option");
        option.value = bb_ids[i];
        option.text = bb_ids[i];
        selectDiv.appendChild(option)
    }
})

// OTU Descriptions
Plotly.d3.json("/otu", function(error, otu) {
    if (error) return console.warn(error);
    pie(otu);
    bubble(otu);
})


// Pie
function pie(otu) {
  Plotly.d3.json("/samples/BB_940", function(error, response) {
      if (error) return console.warn(error);
      var otu_labels = []
      for (i in response.otu_ids.slice(0,9)) {
        otu_labels.push(otu[i]);
      }
    	var data = [{ values: response.sample_values.slice(0,9),
                    labels: response.otu_ids.slice(0,9),
                    type: 'pie',
                    text: otu_labels,
                    textinfo: 'percent',
                    textposition: 'inside',
                    hole: .5,
                    hoverinfo: "text + values + labels"}];

    	var layout = {height: 425, 
    		            width: 400,
                    margin: {
                      l: 25, r: 25, b: 25, t: 75
                    },
    		            title: "Top 10 Sample Values",
    		            annotations: [{
                			font: {
    				            size: 20
    			           },
    			          showarrow: false,
    			          text: 'BBs'}]
    	};

    	Plotly.plot("pie", data, layout)
  })
}

//bubbles
function bubble(otu) {
  Plotly.d3.json("/samples/BB_940", function(error, response){
      if (error) return console.warn(error);
      var otu_labels = [];
      for (i in response.otu_ids) {
        otu_labels.push(otu[i]);
      }
      var data = [{
          x: response.otu_ids,
          y: response.sample_values,
          mode: 'markers',
          text: otu_labels,
          hoverinfo: "'('+x+','+y+')'+text",
          marker: {
              color: ['E7641D',
                         'D46E19',
                         'C17816',
                         'AF8213',
                         '9C8C10'],
              size: response.sample_values
          }
      }];
      var layout = {
          height: 600,
          width: 900,
          title: "Belly Button Bubble Chart",
          xaxis: {title: "OTU IDs"},
          yaxis: {title: "Sample values"}
      };
      Plotly.plot("bubble", data, layout);
  })
}

//metatable
var metatable = document.getElementById("metatable");
Plotly.d3.json("/metadata/BB_940", function(error, response){
    if (error) return console.warn(error);
    htmltable = ""
    for (key in response) {
    	htmltable += "<b>" + key + ": " + " </b>"+ response[key] + "<br>";
    }
    metatable.innerHTML = htmltable
})


//Gauge
Plotly.d3.json("/wfreq/BB_940", function(error, level){
  gauge(level);
})

function gauge(level) {
    var degrees = 9 - level,
    	radius = .5;
    var radians = degrees * Math.PI / 9;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
		  pathX = String(x),
     	space = ' ',
	 	  pathY = String(y),
      pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
    var data = [{ type: 'scatter',
   		x: [0], y:[0],
    	marker: {size: 28, color:'850000'},
    	showlegend: false,
    	name: 'Wash Frequency',
    	text: level,
      // direction: "counter-clockwise",
    	hoverinfo: 'text+name'},
  		{ values: [50/9,50/9,50/9,50/9,50/9,50/9,50/9,50/9,50/9,50],
  		rotation: 90,
  		text: ['8-9', '7-8', '6-7', '5-6',
            '4-5', '3-4', '2-3', '1-2', '0-1' ,''],
  		textinfo: 'text',
  		textposition:'inside',      
  		marker: {colors:['#008000','#228d1b','#359a2d','#46a83e','#55b54e','#64c35f','#73d26f','#81e07f','#90ee90','FFFFFF']},
  		hoverinfo: 'text',
  		hole: .5,
  		type: 'pie',
  		showlegend: false
		}];

	var layout = {
		shapes:[{
	    	type: 'path',
      		path: path,
	     	fillcolor: '850000',
	     	line: {
	        color: '850000'
	      }
	    }],
		title: '<b>Who has been washing their hands a lot?</b> <br> Frequency 0-9',
		height: 500,
		width: 600,
    margin: {
      l: 25, r: 25, b: 25, t: 75
    },
		xaxis: {zeroline:false, showticklabels:false, showgrid: false, range: [-1, 1]},
		yaxis: {zeroline:false, showticklabels:false, showgrid: false, range: [-1, 1]}
	};
	Plotly.plot("gauge", data, layout);
};


//Things change
function optionChanged(sample) {
  var sampURL = `/samples/${sample}`
  var metaURL = `/metadata/${sample}`
  var wfreqURL = `/wfreq/${sample}`

  // New data 
  //otu and sample data
  Plotly.d3.json(sampURL, function(error, newdata) {
    if (error) return console.warn(error);
    newOTU(newdata);
  });

  //metatable
  Plotly.d3.json(metaURL, function(error, response) {
    if (error) return console.warn(error);
    var newhtmltable = [];
    for (key in response) {
    newhtmltable += "<b>" + key + ": " + " </b>"+ response[key] + "<br>";
    }
    metatable.innerHTML = newhtmltable
  })

  //freq for gauge
  Plotly.d3.json(wfreqURL), function(error,newfreq) {
    if (error) return console.warn(error);
    gauge(newfreq)
  }
}

//restyle
function newOTU(newdata){
  Plotly.d3.json("/otu", function(error, otu) {
    if (error) return console.warn(error);
    updatePlots(otu, newdata);
  })
}

function updatePlots(otu, newdata) {
  // OTU
  var new_otu = [];
  for (i in newdata.otu_ids) {
        new_otu.push(otu[i]);
  }
  // Pie
  var newPie = document.getElementById("pie");
  Plotly.restyle(newPie, "labels", [newdata.otu_ids.slice(0,10)]);
  Plotly.restyle(newPie, "values", [newdata.sample_values.slice(0,10)]);
  Plotly.restyle(newPie, "text", [new_otu.slice(0,10)]);
  // Bub
  var newBubble = document.getElementById("bubble");
  Plotly.restyle(newBubble, "x", [newdata.otu_ids]);
  Plotly.restyle(newBubble, "y", [newdata.sample_values]);
  Plotly.restyle(newBubble, "text", [new_otu])};