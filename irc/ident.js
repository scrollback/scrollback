"use strict";

var net= require('net');
var log = require("../lib/logger.js");
var users = {},server;

exports.init=function(){
	var portPair, msg, user;
	
	server= net.createServer(function(connection){
		log("Query from: "+connection.remoteAddress+":"+
					connection.remotePort);
		connection.on("data",function(data) {
			log("Got request: "+data);
			data = data.toString();
			if ( typeof data === "undefined" ||
						data.length===0 ||
						data.toString().indexOf(",")<=0
				) {
				connection.end();
				return;
			}
			portPair=data.toString().replace(/\s/g, '');
			user = users[portPair];
			if (user) {
				msg=portPair+" : USERID : OTHER : "+
							user+"\r\n";
			} else {
				msg=portPair+" : ERROR : NO-USER"+"\r\n";
			}
			log("sending Ident: "+msg);
			connection.end(msg+"\r\n");
		});
	});

	server.listen(113,function(){});

};


exports.register=function(localPort, remotePort,uid){
	var id=localPort+","+remotePort;
	log("registering: "+id);
	users[id] = uid;
};

exports.remove=function(localPort,remotePort){
	if (users[localPort+","+remotePort]) {
			delete users[localPort+","+remotePort];
	}
};