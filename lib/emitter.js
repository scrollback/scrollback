/* Bus - A generic event bus
 *
 * Use var myObj = Object.create(Bus) to inherit the functions
 * Use myObj.on('event', callback) to attach event handlers
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

var handlers = {};

function fire (listeners, data, i, cb) {
	if(i < listeners.length) {
		listeners[i].fn(data, function(err, res) {
			if(err) {
				if(cb) return cb(err, data);
				else return;
			} 
			return fire(listeners, data, i+1, cb);
		});
	} else {
		if(cb) cb(null, data);
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
    on: function (event, callback, priority) {
		var i;
		if(!priority) priority = 500;
		else if(typeof priority === 'string') priority = priorities[priority];
		if(typeof callback !== 'function') throw new Error("INVALID_LISTENER");
		if(!handlers[event]) handlers[event] = [];

		var pos = 0;
		var len = handlers[event].length;
		if(len && priority < handlers[event][len-1].priority){
			handlers[event].push({fn: callback, priority: priority});
		}
		else {
			for(i=0; i<len; i++){
				pos = i;
				if(handlers[event][i].priority <= priority){
					break;	
				}
			}
			handlers[event].splice(pos, 0, {fn: callback, priority: priority});
		}
	}
};

