"use strict";


var net= require('net');

var users = {},server;

users["37282,6667"] = {
	uid:"blahblahblah"
};

exports.init=function(){
	
	var portPair, msg, user;
	server= net.createServer(function(connection){
		connection.on("data",function(data) {
			log("Got ident request: "+data);
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
							user.uid+"\r\n";
			} else {
				msg=portPair+" : ERROR : NO-USER"+"\r\n";
			}
			connection.end(msg+"\r\n");
		});
	});

	server.listen(113,function(){});

};


exports.register=function(incomingPort,outgoingPort,origin,uid){
	var id=incomingPort+","+outgoingPort;
	users[id] = {uid:uid};
};

exports.remove=function(incomingPort,outgoingPort){
	if (users[incomingPort+","+outgoingPort]) {
			delete users[incomingPort+","+outgoingPort];
	}
};


this.init();