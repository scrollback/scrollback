var log = require("../../lib/logger.js");
var jade = require("jade"), fs = require("fs");
var blockWords={};
var longest = 0;

module.exports = function(core) {
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
	core.on('text', function(message, callback) {
		log("Heard \"text\" event");
        if (message.session){
            var gateway = message.session.substring(0, message.session.indexOf(":"));
            if(gateway != "web") return callback();
        }
        var text;
		if(message.type=="text")	text = message.text;
		if(message.type == "nick")	text = message.ref;
		if(message.to)	text += " " + message.to;
		if(text) {
			core.emit("getRooms",{id:message.to}, function(err, data) {
                log("Get Rooms", data);
				if(err) return callback(err);
                data = data.results;
                if(!data) callback();
				if(data.length == 0) return callback();
                data = data[0].room;
                if(!data) callback();
	            if(data.params && data.params.wordban) {
	            	if(rejectable(text)){
                        if(!message.labels) message.labels = {};
                        message.labels.abusive = 1;
                    }
                }
	           	callback();
	        });
		}else{
			callback();
		}
	}, "antiabuse");

	core.on("room", function(action, callback){
		var room  = action.room;
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
    log("text", text);
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
