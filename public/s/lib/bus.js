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

/* exported Bus */

function Bus() {
	this.handlers = {};
}

Bus.prototype.emit = function (event, data, cb) {
	var handlers = this.handlers, listeners = handlers[event];
	
	function fire (i) {
		function next(err) {
			if(err) return cb && cb(err, data);
			return fire(i+1);
		}
		
		if(i < listeners.length) {
			listeners[i].fn(data, next);
		} else {
			if(cb) cb(null, data);
		}
	}
	
	if (listeners) {
		fire(0);
	} else if(cb) {
		cb();
	}
};

Bus.prototype.on = function (event, callback, priority) {
	var i, l, handlers = this.handlers;
	if(typeof priority !== 'number') priority = 500;
	if(typeof callback !== 'function') throw new Error("INVALID_LISTENER");
	
	if(!handlers[event]) handlers[event] = [];
	
	for(i=0, l=handlers[event].length; i<l && handlers[event][i].priority <= priority; i++);
	handlers[event].splice(i, 0, {fn: callback, priority: priority});
};