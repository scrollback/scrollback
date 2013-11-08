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

var handlers = {}, catSeq = {
	"message":["validation","auth","default","gateway"],
	"room":["validation","auth","default","gateway"]
},
catIx = {
	"message":{},
	"room":{}
};

function fire (listeners, data, i, cb) {
	if(i < listeners.length) {
		listeners[i](data, function(err) {
			if(err) return cb(err);
			return fire(listeners, data, i+1, cb);
		});
	} else {
		cb();
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
    handlers:handlers,
    catSeq:catSeq,
    catIx:catIx,

    on: function (event, callback, cat) {
		// if(typeof callback !== 'function') throw new Error("INVALID_LISTENER");
		

		// if(!cat) cat = "default";
  //       if (!handlers[event]) handlers[event]=[];
  //       // .push(callback);
  //       // else handlers[event] = [callback];

  //       if(!catIx[event]) {
		// 	catIx[event] = {};
		// }

		// if(!catIx[event][cat]) catIx[event][cat] = findIndex(catIx[event], catSeq[event], cat);
		// incIndex(catIx[event], catSeq[event], cat);
		// handlers[event].splice(catIx[event][cat],0,callback);
		 if(typeof callback !== 'function') throw new Error("INVALID_LISTENER");
                
        if (handlers[event]) handlers[event].push(callback);
        else handlers[event] = [callback];
	}
};


// catSeq['eventname'] = [String];
// handlers['eventname'] = [functions]
// catIx['event'] = {'categoryName': array index (number); }

// //.emit() -> fire()


// validation 0
// auth 0
// default 0
// gateway 0


// on auth


function findIndex(ix, seq, cat) {
	var lix=0, i, c;
	for(i=0; i<seq.length; i++) {
		c = seq[i];
		if(c == cat) break;
		if(ix[c] && ix[c] > lix) lix = ix[c];
	}
	return lix;
}

function incIndex(ix, seq, cat) {
	var inc=0, i, c;
	console.log(seq, cat);
	for(i=0; i < seq.length; i++) {
		if(c == cat) inc=1;
		if(ix[seq[i]]) ix[seq[i]] += inc;
	}
}
