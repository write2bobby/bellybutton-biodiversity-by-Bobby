# import necessary libraries
import numpy as np
import os
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session, load_only
from sqlalchemy import create_engine, func, desc, inspect

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

########################`#########################
# Flask Setup
#################################################
app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD']=True
#################################################
# Database Setup
#################################################
from flask_sqlalchemy import SQLAlchemy

engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")
# Reflecting db into a new model
Base = automap_base()
# reflect tables
Base.prepare(engine, reflect=True)
# Save to class
session = Session(engine)

Metadata = Base.classes.samples_metadata
Otu = Base.classes.otu
Samples = Base.classes.samples

def __repr__(self):
    return '<Bio %r>' % (self.name)
#inspector = inspect(engine)
#print(inspector.get_table_names())
#print(inspector.get_columns('otu'))
#print(inspector.get_columns('samples'))
#print(inspector.get_columns('samples_metadata'))

# Create a route that renders the index.html homepage template
@app.route("/")
def home():
    return render_template("index.html")

@app.route('/names')
def names_list():
	inspector = inspect(engine)
	columns = inspector.get_columns('samples')
	names_list = []
	for column in columns[1:]:
 		names_list.append(column['name'])
	return jsonify(names_list)

@app.route('/otu')
def otu():
	results = session.query(Otu.lowest_taxonomic_unit_found).all()
	otu_list = []
	for result in results:
		otu_list.append(result[0])
	return jsonify(otu_list)

@app.route('/metadata/<sample>')
def metadataSample(sample):
	bb_id = sample[3:]
	results = session.query(Metadata.AGE,\
		Metadata.BBTYPE,\
		Metadata.ETHNICITY,\
		Metadata.GENDER,\
		Metadata.LOCATION,\
		Metadata.SAMPLEID).filter(Metadata.SAMPLEID == bb_id).first()
	metadict = {
		"AGE": results[0],
		"BBTYPE": results[1],
		"ETHNICITY": results[2],
		"GENDER": results[3],
		"LOCATION": results[4],
		"SAMPLEID": results[5]
	}
	return jsonify(metadict)

@app.route('/wfreq/<sample>')
def wfreq(sample):
    bb_id = sample[3:]
    result = session.query(Metadata.WFREQ,\
                           Metadata.SAMPLEID)\
                    .filter(Metadata.SAMPLEID == bb_id).first()
    return jsonify(result)


@app.route('/samples/<sample>')
def samp(sample):
    bb_id_query = f"Samples.{sample}"
    results = session.query(Samples.otu_id,\
                           bb_id_query)\
                     .order_by(desc(bb_id_query))
    sampdict = {"otu_ids": [result[0] for result in results],
                "sample_values": [result[1] for result in results]}
    return jsonify(sampdict)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port = port, debug=True)