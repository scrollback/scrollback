var fs = require('fs');
var request = require('request');
var sync = require('sync');

exports.execute = function(cypherFile,params) {
	var result=[],response;
	var cypher = fs.readFile.sync(null,"./core/queries/"+cypherFile+".cypher","utf8");
	var options = {
		uri: 'http://localhost:7474/db/data/cypher',
		method: 'POST',
		json: {
			"query" : cypher,
			"params" : params
		}
	};
	response=request.sync(null,options);
	if(response[0].statusCode!=200){
		//console.log(response);

		throw "http error";
	}
	for(i=0,l=response[0].body.data.length;i<l;i++)
	{
		result.push(response[0].body.data[i][0].data);
	}
	return(result);
}.async();

