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
		console.log("Peeking: ", scrollback.streams)
		for(i=0; i<scrollback.streams.length; i++) {
			if(scrollback.streams[i])
				socket.emit('peek', scrollback.streams[i]);
		}
	}
});

function requestTime() {
	socket.emit('time', new Date().getTime());
}
requestTime(); setTimeout(requestTime, 300000);
socket.on('time', function(data) {
	timeAdjustment = data.server - (new Date().getTime() + data.request)/2;
	console.log("Time adjustment is ", timeAdjustment);
});

socket.on('message', function(message) {
	var stream;
	console.log(message);
	if(message.type == 'join' && message.from == nick) {
		console.log(message.to);
		stream = streams[message.to];
		if(!stream){
			console.log("stream missing", message.to);
			return;
		}
		socket.emit('get', {
			to: stream.id, until: message.time,
			since: stream.lastMessageAt, type: 'text'
		});
		console.log("calling stream ready");
		stream.ready();
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