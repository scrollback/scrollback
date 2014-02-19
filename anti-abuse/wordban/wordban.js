var log = require("../../lib/logger.js");
var jade = require("jade"), fs = require("fs");
var blockWords={};
var longest = 0;

module.exports = function(core) {
	var pluginContent = "";
	fs.readFile(__dirname + "/wordban.html", "utf8", function(err, data){
		if(err)	throw err;
		core.on("http/init", function(payload, callback) {
            payload.wordban = {
				config: data
			};
            callback(null, payload);
        }, "setters");
	});
	init();
	core.on('message', function(message, callback) {
		log("Heard \"message\" event");
		var text;
		if (message.origin && message.origin.gateway == "irc") return callback();


		if(message.type=="text")	text = message.text;
		if(message.type == "nick")	text = message.ref;
		if(message.to)	text += " "+message.to;
		if(text) {
			core.emit("rooms",{id:message.to}, function(err, data) {
				if(err) return callback(err);
				if(data.length == 0) return callback();
	            if(data[0].params && data[0].params.wordban)
	            	if(rejectable(text)) return callback(new Error("BANNED_WORD"));
	           	callback();
	        });
		}else{
			callback();
		}
	}, "antiabuse");

	core.on("room", function(room, callback){
		var text = room.id+(room.name?(" "+room.name):"")+" "+(room.description?(" "+room.description):"");
		if(rejectable(text)) return callback(new Error("Abusive room name"));
		callback();
	}, "antiabuse");
};
var init=function(){
	fs.readFile(__dirname + "/blockedWords.txt","utf-8", function (err, data) {
		if (err) throw err;

		data.split("\n").forEach(function(word) {
			if (word) {
				word.replace(/\@/g,'a');
				word.replace(/\$/g,'s');

				word = word.replace(/\W+/, ' ').toLowerCase().trim();
				if (word.length==0) {
					return;
				}
				if (word.length > longest) {
					longest = word.length;
				}
				blockWords[word] = true;
			}
		});
	});
}


var rejectable = function(text) {
	var i, l, j, words, phrase;
	words=text.replace(/\@/g,'a').replace(/\$/g,'s');
	words = words.toLowerCase().split(/\W+/);

	for(i=0,l=words.length-1;i<l;i++) {
		phrase = words[i];
		for (j=i+1; j<=l; j++) {
			phrase = phrase + ' ' + words[j];
			if (phrase.length <= longest) {
				words.push(phrase);
			}
		}
	}

	for(i=0,l=words.length;i<l;i++) {
		if (blockWords[words[i]]) {
			log("found the word " + words[i]+"---");
			return true;
		}
	}
	return false;
};
