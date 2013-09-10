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

var handlers = {};

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
			console.log(cb);
			cb();
		}
    },

    on: function (event, callback) {
		if(typeof callback !== 'function') throw new Error("INVALID_LISTENER");
		
        if (handlers[event]) handlers[event].push(callback);
        else handlers[event] = [callback];
    }
};

