/* global libsb, currentState, $ */

function upDateNotifier(roomName, type){
	// updates the room notifer
	var className = '#room-item-' + roomName;
	if(type === 'remove'){
		$(className).find('.notif-counter').text("");
		$(className).find('.notif-counter').removeClass('mentioned unread');
		return;
	}
	var counter = $(className).find('.notif-counter').text();
	
	if(counter === "") counter = 0;
	else counter = parseInt(counter);
	counter++;
	$(className).find('.notif-counter').removeClass('hidden').addClass(type).text(counter);
}

libsb.on('text-dn', function(text, next){
	var flag = 0;
	if(text.to !== currentState.roomName){
		text.mentions.forEach(function(user){
			if(user === libsb.user.id){
				upDateNotifier(text.to, 'mentioned');
				flag = 1;
			}
		});
		
		if(flag === 0) upDateNotifier(text.to, 'unread');
	}
	next();
}, 1000);

libsb.on('navigate', function(state, next){
	if(state.roomName !== state.old.roomName){
		upDateNotifier(state.roomName, 'remove');
	}
	next();
}, 500);