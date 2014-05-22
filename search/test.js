/**
 * New node file
 */
var es = require('elasticsearch');

var client = es.Client({
	host:'localhost:9200'
});

/*client.index({
	index:'test',
	type:'temp',
	id:'uccms9bh0o0cfgvijdlzykfcsv178b4d',
	body:{
			text: 'Realty, healthcare stocks steal the show',
			from: 'guest-mervin',
			to: 'testingRoom',
			type: 'tex`t',
			time: 1396446151761,
		}
	},function(err,resp){
		if(err) {console.log("error in indexing");}
		console.log(resp);
	});
*/
/*
client.bulk({
	body: [
	{
		index:{
			_index: 'sb',
			_type: "threads",
			_id: "cnauajkdsnckajsdnckjnlkj"
		}
	}
	,
	{
		id: "cnauajkdsnckajsdnckjnlkj",
		title: "this is a stupid thread",
		startedBy: "harish",
		text1: "stupid message1",
		text2: "stupid message2",
		text3: "not so stupid message3"
	},
	{
		index:{
			_index: 'sb',
			_type: "threads",
			_id: "kajcsnioujnaisnckjlasd"
		}
	},
	{
		id: "kajcsnioujnaisnckjlasd",
		title: "this is a super thread",
		startedBy: "vik",
		text1: "genius message1",
		text2: "genius message2",
		text3: "not so genius stupid message3"
	}]
},function(err,resp){
	if(err) {console.log("error in indexing");}
	console.log(resp);
});
*/

client.search({index: 'sb',type:"threads", timeout:30000,body: {query: { match: {"_all": 'life'}}}}).then(function (body) {
		var hits = body.hits.hits;
		hits.forEach(function(e) {
			console.log(e._source);
		});
		// console.log(hits);
		console.log("done");
	}, function (error) {
  console.trace(error.message);

});