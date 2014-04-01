var log = require("../lib/logger.js");
var config = require('../config.js');
var client;
var es = require('elasticsearch');
var pendingCallbacks = {};
module.exports = function(core) {
	if (config.search) {
		init();
		core.on('text', function(message, callback) {
		if(message.type == "text") {//if client connected and text message
			var msg = JSON.stringify({
				id: message.id, time: message.time, author: message.from.replace(/guest-/g,""),
				text: message.text.replace(/['"]/g, ''),
				room: typeof message.to=="string" ? message.to:message.to[0]
			});
			log("Sending msg to scrollback.jar="+msg);	
			client.index({
				index:'messages',
				type:'post',
				id:message.id,
				body: {
					time:msg.time,
					author:msg.author,
					text:msg.text,
					room:msg.room
				}
			}, function(err,resp) {
				if(err) {log("error while endexing data")}
			});
		}
		return callback();
		}, "watchers");
		
		core.on("getTexts", function(query, callback){
			if(!query) return callback();
			es.search({
				index: 'messages',
				  body: {
				    query: {
				      match: {
				        title: 'fuck'
				      }
				    },
				    facets: {
				      tags: {
				        terms: {
				          field: 'text'
				        }
				      }
				    }
				  }
				}, function (error, response) {
					if(error) {log("error while searching data")}
				})
				});
			return callback();
		}, "watchers");
		
	}
	else{
		log("threader module is not enabled");
	}
};

function init(){
	log("Trying to connect to elastic search server .... ");
	var searchServer = config.search.server+":"+config.search.port;
	client = es.Client({
		host:searchServer,
		sniffOnStart:true,
		sniffInterval:300000
	});
}

