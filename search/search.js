var log = require("../lib/logger.js");
var config = require('../config.js');
var client;
var es = require('elasticsearch');
module.exports = function(core) {
	init();
	if (config.search) {
		core.on('text', function(message, callback) {
		if(message.type == "text") {
			var msg = JSON.stringify({
				id: message.id, time: message.time, author: message.from.replace(/guest-/g,""),
				text: message.text.replace(/['"]/g, ''),
				room: typeof message.to=="string" ? message.to:message.to[0]
			});
			log("message: "+msg);	
			client.index({
				index:'sb',
				type:'text',
				id:message.id,
				body:{"text":msg.text,"time":msg.time,"room":msg.room,"author":msg.author}
			}, function(err,resp) {
				if(err) {console.log("error while endexing data");}
				console.log(resp);
			});
		}
		return callback();
		}, "watchers");
		
		core.on("getTexts", function(qu, callback){
			console.log("query string: "+qu.q);
			if(!qu.q) return callback();
			client.search({index: 'sb',timeout:30000,body: {query: { match: {text: qu.q}}}}, function (error, response) {
					if(error) {log("error while searching data");}
					qu.results = response;
					callback(qu);
				});
		}, "watchers");		
	}
	else{
		log("Search module is not enabled");
	}
};

function init(){
	log("Trying to connect to elastic search server .... ");
	var searchServer = config.search.server+":"+config.search.port;
	client = new es.Client({
		host:searchServer
	});
}

