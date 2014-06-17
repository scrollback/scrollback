var log = require("../../lib/logger.js");
var jade = require("jade"), fs = require("fs");
var config = require("../../config.js");
var blockWords={};
var longest = 0;

log("Checking");

module.exports = function(core) {

	init();
	core.on('text', function(message, callback) {
		log("Heard \"text\" event");
        if (message.session){
            var gateway = message.session.substring(0, message.session.indexOf(":"));
            if(gateway == "irc" || gateway=="twitter") {
            	return callback();
            }
        }

    	var text;
   		
    	log(message);
		if(message.type=="text")	text = message.text;
		if(message.type == "nick")	text = message.ref;
		if(message.to)	text += " " + message.to;

		if(text) {
			session = Object.keys(config.whitelists)[0];
			core.emit("getRooms",{id:message.to, session:session}, function(err, data) {
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
	        });
		}

		var customWords = message.room.params['anti-abuse'].customWords;
		textMessage = message.text;
		log("Text message: ",textMessage);
		log("Custom words: ", customWords);

	    for (index=0; index<customWords.length; ++index) {
			if((textMessage.toLowerCase()).indexOf(customWords[index])!= -1)
				{
					
					if(customWords[index]===''){
						return callback();
					}
					log("You cannot use banned words!");
					if(!message.labels) message.labels = {};
					message.labels.abusive = 1;
					return callback(new Error("Abusive_word"));
				}
		}
		
	}, "antiabuse");

	core.on("room", function(action, callback){
		var room  = action.room;
        var text = room.id+(room.name?(" "+room.name):"")+" "+(room.description?(" "+room.description):"");
		if(rejectable(text)) return callback(new Error("Abusive_room_name"));
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
};

