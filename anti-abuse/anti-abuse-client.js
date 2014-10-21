/* jshint browser: true */
/* global $, libsb, currentState */

var formField = require("../lib/formField.js");

libsb.on("config-show", function(tabs, next) {
	var room = tabs.room, lists;
	if (!room.params) room.params = {};
    if (!room.params.antiAbuse) {
        room.params.antiAbuse = {block: {english: false}, customPhrases: [], spam: true};
	}
    var antiAbuse = room.params.antiAbuse;
	var $div = $("<div>").append(
        formField("Spam control", "toggle", "spam-control", antiAbuse.spam),
        formField("Blocked words list", "check", "blocklists", [
            ["list-en-strict", "English abusive words", antiAbuse.block.english ]
        ]),
        formField("Custom blocked phrases/word", "area", "block-custom", antiAbuse.customPhrases.join("\n")),
        formField("", "info", "spam-control-helper-text", "One phrase/word each line")
    );



	tabs.spam = {
		text: "Spam control",
		html: $div,
		prio: 600
	};

	next();
}, 500);


libsb.on("config-save", function(room, next){
	room.params.antiAbuse = {
        spam: $("#spam-control").is(":checked"),
        block:{
            english: $("#list-en-strict").is(":checked")
        },
		customPhrases: $("#block-custom").val().split("\n").map(function(item) {
			return (item.trim()).toLowerCase();
		})
	};
	next();
}, 500);

function hasLabel(label, labels){

	for(var i in labels){
		if(i === label && labels[i] === 1){
			return true;
		}
	}
	return false;
}

libsb.on('text-menu', function(menu, next) {
	if(menu.role !== "owner") return next();
	var textObj;
	libsb.emit('getTexts', {ref: menu.target.id.substring(5), to: currentState.roomName}, function(err, data){
		textObj = data.results[0];
		var target = menu.target;
		var textMsg = $(target).find('.chat-message').text();

		if(!hasLabel('hidden', textObj.labels)){
			menu.items.hidemessage = {
				prio: 500,
				text: 'Hide Message',
				action: function(){
					libsb.emit('edit-up', {to: currentState.roomName, labels: {'hidden': 1}, text: textMsg, ref: target.id.substring(5), cookie: false});
					$(target).addClass('chat-label-hidden');
				}
			};
		} else{
			menu.items.unhidemessage = {
				prio: 500,
				text: 'Unhide Message',
				action: function(){
					libsb.emit('edit-up', {to: currentState.roomName, labels: {'hidden': 0}, text: textMsg, ref: target.id.substring(5), cookie: false});
					$(target).removeClass('chat-label-hidden');
				}
			};
		}
		if(hasLabel('abusive', textObj.labels)){
			menu.items.markasnotabusive = {
				prio: 500,
				text: 'Mark as not abusive',
				action: function(){
					libsb.emit('edit-up', {to: currentState.roomName, labels: {'abusive': 0}, text: textMsg, ref: target.id.substring(5), cookie: false});
				}
			};
		}
		next();
	});
}, 500);
