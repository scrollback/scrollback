"use strict";

var dgram = require("dgram"), users = {}, server= dgram.createSocket('udp4');

users["23,6191"] = {
	origin:"OTHER",
	uid:"aksdbkljasdlfkjnasdflhk"
};



exports.init=function(){		
	server.bind(113);
	
	server.on("message",function(data, rinfo) {
		var portPair,i,msg, user;
		console.log("Request from:"+rinfo.address+": "+rinfo.port+":"+data);
		
		if (typeof data === "undefined") {
			return;
		}
		
		portPair=data.toString().replace(/\s/g, '');
		user = users[portPair];
		
		portPair=portPair.split(",")[0]+", "+portPair.split(",")[1];
		
		//msgParts=data.toString().split(",");
		//portPair=msgParts[0].trim();
		//portPair=portPair+","+msgParts[1].trim();
				
		if (user) {
			msg=new Buffer(portPair+" : USERID : "+user.origin+" : "+
						user.uid+"\r\n");
		} else {
			msg=new Buffer(portPair+" : ERROR : NO-USER"+"\r\n");
		}
		
		
		server.send( msg, 0, msg.length, rinfo.port, rinfo.address,
			function(err,bytes) {
				console.log("message sent: "+msg);
			}
		);
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