"use strict";

/* ChainingEmitter - chained event listeners
 *
 * Use var myObj = Object.create(EventEmitter) to inherit the functions
 * Use myObj.on('event', callback) to attach event handlers
 *   
 * Use emit('event', data, callback) to trigger the event handlers
 * 
 *   Each listener is called with two parameters, data and a function.
 *   
 *   Listeners are expected to call the function with no parameters
 *   if they are successful, and with an error object to stop the
 *   event from propagating to downstream listeners.
 *   
 *   Finally, the callback passed to emit itself will be called, either 
 *   with no arguments, if all handlers were successful, or with
 *   the error object returned by the listener which failed.
 */

/*
	Change this into a priority score-based system.
	
	var priorities = {
		antiflood: 100,
		validation: 200,
		authentication: 300,
		authorization: 400,
		antiabuse: 500,
		modifier: 600,
		gateway: 700,
		cache: 800,
		storage: 900,
		watcher: 1000
	};
*/

var handlers = {}, catSeq = {
	/* split message into  */
	"message":["antiflood","validation","authentication","loader","authorization","antiabuse","modifier","gateway","cache","storage","watcher"],
	"room":["antiflood","validation","authentication","authorization","antiabuse","modifier","gateway","cache","storage","watchers"],
	"members":["storage"], /* deprecated; Replace with users(memberOf) and rooms(hasMember) */
	"occupant":["storage"],  /* deprecated; Replace with rooms/users(storage) */
	"http/init": ["setters"],
	"rooms":["cache","storage"],
	"messages":["leveldb","storage"], /* rename: getTexts */
	"text":["initializer","loader","storage"],
	"back":["initializer","loader","storage"],
	"away":["initializer","loader","storage"],
	"join":["initializer","loader","storage"],
	"part":["initializer","loader","storage"],
	"kick":["initializer","loader","storage"],
	"admit":["initializer","loader","storage"],
	"expel":["initializer","loader","storage"],
	"getUsers":["initializer","loader","cache","storage"],
	"getRooms":["initializer","loader","cache","storage"],
	"user":["initializer","loader","storage"],
	/* room, user */
	"edit":["initializer","loader","validation","storage", "gateway"],
	"init":["loader","storage"]
},catIx ={}, i;

function fire (listeners, data, i, cb) {
	if(i < listeners.length) {
		listeners[i](data, function(err, res) {

			// if err is boolean and true, then it means that we got the results and stop calling other plugins.
			if (err === true) {
				if(cb)	return cb(null, res);
				else return;
			} else if(err) {
				if(cb)	return cb(err, data);
				else return;
			} 
			return fire(listeners, /* res || */ data, i+1, cb);
		});
	} else {
		cb && cb(null, data);
	}
}

module.exports = {
    emit: function (event, data, cb) {
        if (handlers[event]) {
			fire(handlers[event], data, 0, cb);
        } else {
			cb();
		}
    },
    on: function (event, callback, cat) {
		if(typeof callback !== 'function') throw new Error("INVALID_LISTENER");
		if(!cat) cat = "watchers";
		if(!catIx[event]) catIx[event] = {};
		if(!handlers[event]) handlers[event]=[];
		if(!catIx[event][cat]) catIx[event][cat] = findIndex(catIx[event], catSeq[event], cat);
		incIndex(catIx[event], catSeq[event], cat);
		handlers[event].splice(catIx[event][cat],0,callback);
	}
};

function findIndex(ix, seq, cat) {
	var lix=0, i, c;
	for(i=0; i<seq.length; i++) {
		c = seq[i];
		lix = ix[c];
		if(c == cat) break;
	}
	return lix;
}

function incIndex(ix, seq, cat) {
	var inc=0, i, c;
	for(i=0; i < seq.length; i++) {
		if(typeof ix[seq[i]]=="undefined") ix[seq[i]] = 0;
		if(seq[i] == cat) {
			inc=1;
			continue;
		}
		ix[seq[i]] += inc;

	}
}
