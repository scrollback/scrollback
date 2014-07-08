/*
	UI component to show the menu to the user, when he clicks on a message
*/
/* global $, libsb, document, currentState */
// chat-more
var showMenu = require('./showmenu.js');
$(function(){
	$(document).click('.chat-area', function(event){
		var elem = $(event.target).closest('.chat-item').get(0);
		var target = $(elem).find('.chat-more').get(0);
		if(event.target !== target) return;
		var messageId = elem ? elem.id : "";
		var role = 'registered';
		if(messageId){
			if(/^guest-/.test(libsb.user.id)){
				role = 'guest';
			}else{
				libsb.memberOf.forEach(function(room){
					if(room.id === currentState.roomName && room.role === "owner"){
						role = 'owner';
					}
				});
			}
			libsb.emit('text-menu', {origin: target, items: {}, role: role, target: elem}, function(err, menu){
				delete menu.role;
				delete menu.target;
				showMenu(menu);
			});
		}
	});
});