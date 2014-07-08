var log = require("../../lib/logger.js");
var jade = require("jade"), fs = require("fs");
var blockedUsernames={};
var longest = 0;

module.exports = function(core) {
	init();
	core.on('text', function(message, callback) {
		log("Listening");
		if (message.session){
			var gateway = message.session.substring(0, message.session.indexOf(":"));
			if(gateway != "web") return callback();
		}
		if(rejectable(message)) callback(new Error("BANNED_USERNAME"));
		else callback();
	}, "antiabuse");
};


var init= function(){
	loadBannedUsers();
	setInterval(loadBannedUsers,60*60*1000);
};


function loadBannedUsers(){
	var usersArray=[];
	fs.readFile(__dirname + "/bannedusername.txt","utf-8", function (err, data) {
		if (err) throw err;

		data.split("\n").forEach(function(line) {//
			if (line) {
				var value=line.split(":");//":" based
				if (!usersArray[value[0]]) usersArray[value[0]]=[];
				usersArray[value[0]][value[1]] = true;//0-room 1-username
				log("added into banned username list=" + value[0] + "," + [value[1]]);
			}
		});
		blockedUsernames=usersArray;
	});
}

var rejectable = function(m) {
	if(blockedUsernames[m.to]){
		if(blockedUsernames[m.to][m.from]){
			log("user " + m.from + " is banned in room " + m.to );
			return true;
		}
	}
	return false;
};

