/*
 * This is version 1 of  the client side scrollback SDK.
 *
 * @author Aravind
 * copyright (c) 2012 Askabt Pte Ltd
 *
 *
 * Dependencies:
 *   - addEvent.js
 *   - domReady.js
 *   - getByClass.js
 *   - jsonml2.js
 */
var socket = io.connect(scrollback.host);
var timeAdjustment = 0;


socket.on('connect', function(message) {
	console.log("connected");
	if(scrollback.streams && scrollback.streams.length) {
		for(i=0; i<scrollback.streams.length; i++) {
			console.log("trying to join things");
			socket.emit('message', {
				type: 'join',
				to: scrollback.streams[i]
			});
		}
	}
});

socket.on('message', function(message) {
	var stream;
	if(message.type == 'join' && message.from == nick) {
		console.log(message.to);
		stream = streams[message.to];
		if(!stream || stream.isReady){
			console.log("stream either missing or not ready",message.to);
			return;	
		} 
		socket.emit('get', {to: stream.id, until: message.time, since: stream.lastMessageAt, type: 'text'});
		console.log("calling stream ready");
		stream.ready();
		stream.isReady = true;
	}
	else if(message.type == 'part' && message.from == nick) {
		// do nothing.
	}
	else {
	//	console.log(message.type+" : "+message.text);
		Stream.message(message);
	}
});

socket.on('error', function(message) {
	console.log(message);
});

socket.on('nick', function(n) {
//	console.log("Nick change", n);
	Stream.updateNicks(n);
});