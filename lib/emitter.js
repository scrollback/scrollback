"use strict";

/* ChainingEmitter - chained event listeners
 *
 * Use var myObj = Object.create(EventEmitter) to inherit the functions
 * Use myObj.on('event', callback) to attach event handlers
 * Use emit('event') to trigger the event handlers
 */

var handlers = {};

function fire (listeners, data, i) {
	if(i < listeners.length) listeners[i](data, function(err) {
		if(err) throw err;
		fire(listeners, data, i+1);
	});
}

module.exports = {
    emit: function (event, data) {
        if (handlers[event]) {
			fire(handlers[event], data, 0);
        }
    },

    on: function (event, callback) {
		if(typeof callback !== 'function') throw new Error("INVALID_LISTENER");
		
        if (handlers[event]) handlers[event].push(callback);
        else handlers[event] = [callback];
    }
};

