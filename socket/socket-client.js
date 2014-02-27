/*
	Change extensiuon to typescript later 

*/

var sockjs = require('sockjs-client'),
	generate = require('generate'),
	config = require('../client-config');

module.exports = function(core){
	core.on('connection-requested', connect);
	core.on('text-up', sendText, 1000);
	core.on('back-up', sendBack, 1000);
	core.on('away-up', sendAway, 1000);
	core.on('nick-up', sendInit, 1000);
	
	core.on('getTexts', getTexts);
}

var client;

function connect(){
	client = sockjs.connect(config.sockjs, function(){
		core.emit('connected');
	});
	
	client.onMessage = recieveMessage;
}

function getTexts(query, next){
	
	if(query.results) return next();
	
	if(!query.queryId) query.queryId = generate.guid();
	
	client.send(JSON.stringify(query));
	pendingQueries[query.queryId] = next;
}

function recieveMessage(event){
	try{
		var data = JSON.parse(event.data);
	}catch(err){
		core.emit("error", err);
	}
	
	if(data.queryId){
		// data is a query
		if(pendingQueries[data.queryId]){
			pendingQueries[data.queryId](data);
			delete pendingQueries[data.queryId];
		}
	}else{
		//data is an action
		if(pendingActions[data.id]){
			pendingActions[data.id](data){
				delete pendingActions[data.id];
			}
		}
		core.emit(data.type + '-dn', data);
	}
}




