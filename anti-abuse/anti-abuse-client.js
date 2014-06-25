/* jshint browser: true */
/* global $, libsb, currentState */

var formField = require("../lib/formField.js");

libsb.on("config-show", function(tabs, next) {
	var room = tabs.room, lists;
	
	if(!room.params) room.params = {};
    if (!room.params.antiAbuse) {
        room.params.antiAbuse = {offensive: true};
	}
    
    if (typeof room.params.antiAbuse.wordblock !== "boolean") {
		room.params.antiAbuse.wordblock = true;
	}
    
	if (!(room.params.antiAbuse["block-lists"] instanceof Array)) {
		lists = [];
	}else {
        lists = room.params.antiAbuse["block-lists"];
    }
    
    if(!room.params.antiAbuse.customWords) room.params.antiAbuse.customWords = [];

	var $div = $("<div>").append(
		formField("Block offensive words", "toggle", "block-offensive", room.params.antiAbuse.wordblock),
		formField("Blocked words list", "check", "blocklists-list", [
			["list-en-strict", "English", (lists.indexOf("list-en-strict") > -1)]
			// ["list-en-moderate", "English moderate", (lists.indexOf("list-en-moderate") > -1)],
			// ["list-zh-strict", "Chinese strict", (lists.indexOf("list-zh-strict") > -1)]
		]),
		formField("Custom blocked words", "area", "block-custom", room.params.antiAbuse.customWords)
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
		wordblock: $("#block-offensive").is(":checked"),
		"block-lists": $("input[name='blocklists-list']:checked").map(function(i, el) {
			return $(el).attr("value");
		}).get(),
		customWords: $("#block-custom").val().split(",").map(function(item) {
			return (item.trim()).toLowerCase();
		})
	};

	next();
}, 500);

function hasLabel(label, labels){
	for(var i=0; i<labels.length; i++){
		if(labels[i] === label){
			return true; 
		}
	}
	return false;
}
libsb.on('text-menu', function(menu, next) {
	if(menu.role !== "owner") return next();
	var textObj;
	libsb.emit('getTexts', {ref: menu.target.id, to: currentState.roomName}, function(err, data){
		textObj = data.results[0];
		if(!hasLabel('hidden', textObj.labels)){
			menu["Hide Message"] = function(){
				libsb.emit('edit-up', {to: currentState.room, labels: {hidden: 1}, ref: menu.target.id, cookie: false});
				$(menu.target).addClass('hidden');
			};
		} else{
			menu["Unhide Message"] = function(){
				libsb.emit('edit-up', {to: currentState.room, labels: {hidden: 0}, ref: menu.target.id, cookie: false});
				$(menu.target).removeClass('hidden');
			};
		}
		if(hasLabel('abusive', textObj.labels)){
			menu["Mark as Not Abusive"] = function(){
				libsb.emit('edit-up', {to: currentState.room, labels: {abusive: 0}, ref: menu.target.id, cookie: false});	
			};
		}
	});
	next();
}, 500);
