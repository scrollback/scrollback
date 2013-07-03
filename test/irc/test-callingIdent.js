var dgram = require("dgram");
(function (){
	var client = dgram.createSocket("udp4");
	var msg=new Buffer("32, 6129\r\n");
	client.send( msg, 0, msg.length,113, "localhost", function(err,bytes){
		if(typeof err==="undefined"){
			console.log();
		}
		else{
			console.log("sent:"+msg);
		}
	});
	client.on("message",function(msg,rinfo){
		//console.log("Server REV:"+msg+": from->"+rinfo.address+":"+rinfo.port);
		console.log("RESPONSE:"+msg);
		client.close();
	});
})();
