/* jshint browser: true */
/* global $, libsb, currentState */

var formField = require("../lib/formField.js");

libsb.on('config-show', function(tabs, next) {
    var results = tabs.room;
    var div = $('<div>').addClass('list-view list-view-spam-settings');

    if (!results.params.antiAbuse) {
        results.params.antiAbuse = {offensive: true};
    }

    div.append(formField("Block offensive words", "toggle", 'block-offensive', results.params.antiAbuse.offensive));
    tabs.spam = {
        html: div,
        text: "Spam control",
        prio: 600
    };
    next();
});

libsb.on('config-save', function(room, next){
    room.params.antiAbuse = {
        offensive : $('#block-offensive').is(':checked')
    };
    next();
});

function hasLabel(label, labels){
	for(var i=0; i<labels.length; i++){
		if(labels[i] === label){
			return true; 
		}
	}
	return false;
}
libsb.on('text-menu', function(menu, next){
	if(menu.role !== "owner") return next();
	var textObj;
	libsb.emit('getTexts', {ref: menu.target.id, to: currentState.roomName}, function(err, data){
		textObj = data.results[0];
		console.log("Recieved ", err, textObj);
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
});
