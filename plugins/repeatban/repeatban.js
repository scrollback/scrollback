
var users={};

module.exports = function(core) {
	init();
	core.on('message', function(message, callback) {
		if(rejectable(message)) callback(new Error("REPEATATIVE"));
		else callback();
	});
};


var init=function(){
	//nothing as of now... 
};


var rejectable=function(message){
	var from, room;
	
	
	if (!message.from || !message.to || message.type!='text') {
		return false;
	}
	
	room=message.to;
	from=message.from;
	
	if (!users[from]) {
		users[from]={};
	}

	if (!users[from].messages) {
		users[from].messages=[];
	}

	if (!users[from][room]) {
		users[from][room]=[];
	}

	if (!users[from].messages) {
		users[from].messages=[];
	}

	users[from][room].push(message);
	users[from].messages.push(message);

	if (users[from][room].length>20) {
		users[from][room].shift();
	}

	if (users[from].messages.length>10) {
		users[from].messages.shift();
	}

	if (message.text!=undefined) {
		var capsLength=message.text.replace(/[^A-Z]/g, "").length;
		var totalLength=message.text.length;
		if (capsLength>(totalLength*0.6)) {
			return true;
		}
	}
	
	if (checkRepetition(message,users[from].messages)) {
		console.log("REP:message:"+message.text);
		return true;
	}
	if (checkRepetition(message,users[from][room])) {
		console.log("REP:message:"+message.to+":"+message.text);
		return true;
	}
	
	return false;
};
	




function checkRepetition(message,messageArray) {
	var i,j,count=0;
	for(i=0,l=messageArray.length;i<l;i++){
		if (message.text===messageArray[i].text) {
			count++;
			if (count==3) {
				return true;
			}
		}
	}
	return false;
}
