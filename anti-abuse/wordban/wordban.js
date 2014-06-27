var log = require("../../lib/logger.js"),
	fs = require("fs"),
	blockWords={},
	longest = 0;

log("Checking");

module.exports = function(core) {

	init();
	core.on('text', function(message, callback) {
		var room = message.room, text, customWords, index, l;

		log("Heard \"text\" event");
        if (message.session){
            var gateway = message.session.substring(0, message.session.indexOf(":"));
            if(gateway == "irc" || gateway=="twitter") {
				return callback();
            }
        }

		text = message.text;
		text += " " + message.to;

		if(room.params && room.params.antiAbuse) {
			if (room.params.antiAbuse.wordblock) {
				if(rejectable(text)){
					if(!message.labels) message.labels = {};
					message.labels.abusive = 1;
					log(message);
					return callback();
				}
			}

			if (message.room.params.antiAbuse.customWords) {
				customWords = message.room.params.antiAbuse.customWords;
				textMessage = message.text;

				for (index=0, l = customWords.length; index<l; ++index) {
					if((textMessage.toLowerCase()).indexOf(customWords[index])!= -1) {
						if(customWords[index]==='') continue;
						log("You cannot use banned words!");
						if(!message.labels) message.labels = {};
						message.labels.abusive = 1;
						break;
					}
				}
			}
		}

		return callback();
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
				if (word.length===0) {
					return;
				}
				if (word.length > longest) {
					longest = word.length;
				}
				blockWords[word] = true;
			}
		});
	});

};

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

