/**
 * New node file
 */
var es = require('elasticsearch');

var client = es.Client({
	host:'localhost:9200'
});

client.index({
	index:'test',
	type:'temp',
	id:'uccms9bh0o0cfgvijdlzykfcsv178b4d',
	body:{
			text: 'Realty, healthcare stocks steal the show',
			from: 'guest-mervin',
			to: 'testingRoom',
			type: 'text',
			time: 1396446151761,
		}
	},function(err,resp){
		if(err) {console.log("error in indexing");}
		console.log(resp);
	});


client.search({index: 'test',timeout:30000,body: {query: { match: {text: 'steal'}}}}).then(function (body) {
		var hits = body.hits;
		console.log(hits);
	}, function (error) {
  console.trace(error.message);
});