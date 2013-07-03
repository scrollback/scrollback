"use strict";

var dgram = require("dgram"), users = {}, server= dgram.createSocket('udp4');

users["23,6191"] = {
	origin:"OTHER",
	uid:"aksdbkljasdlfkjnasdflhk"
};



exports.init=function(){		
	server.bind(113);
	
	server.on("message",function(data, rinfo) {
		var msgParts, portPair,i,msg, user;
		console.log("Server REV:"+data+": from->"+rinfo.address+":"+rinfo.port);
		if (typeof data === "undefined") {
			return;
		}
		
		
		user = users[data.toString().replace(/\s/g, '')];
		
		//
		//msgParts=data.toString().split(",");
		//portPair=msgParts[0].trim();
		//portPair=portPair+","+msgParts[1].trim();
				
		if (user) {
			msg=new Buffer(data+" : USERID : "+user.origin+" : "+
						user.uid);
		} else {
			msg=new Buffer(data+" : ERROR : NO-USER");
		}
		
		server.send( msg, 0, msg.length, rinfo.port, rinfo.address,
			function(err,bytes) {
				console.log("message sent: "+msg);
			}
		);
	});
	
	server.on("listening",function(lis){
		console.log("listening..");
	});
};


exports.register=function(incomingPort,outgoingPort,origin,uid){
		
	var id=incomingPort+","+outgoingPort;
	users[id]={
		origin: origin,
		uid: uid
	};
	
};




exports.remove=function(ports){
	var i;
	for (i in users) {
		if (i === ports) {
			delete users[i];
			return;
		}
	}
};