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
	antiflood: 1000,
	validation: 900,
	appLevelValidation: 850,
	loader: 850,
	sudo: 825,
	authentication: 800,
	authorization: 700,
	antiabuse: 600,
	modifier: 500,
	gateway: 400,
	cache: 300,
	storage: 200,
	watcher: 100
};
var debug = false;
var handlers = {};

function fire (listeners, data, i, cb) {
	if(i < listeners.length) {
        if(debug) console.log("calling "+listeners[i].line);
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
			if(cb) cb();
		}
    },
    on: function (event, callback, priority) {
		var i, line = new Error().stack.split("\n")[2], index;
        index = line.lastIndexOf("/");
        line = event + " handler at " +line.substring(index+1);
		if(!priority) throw new Error("INVALID_PARAMETERS");
		else if(typeof priority === 'string') priority = priorities[priority];

		if(typeof callback !== 'function') throw new Error("INVALID_LISTENER");
		if(!handlers[event]) handlers[event] = [];

		var pos = 0;
		var len = handlers[event].length;
		if(len && priority < handlers[event][len-1].priority){
			handlers[event].push({fn: callback, priority: priority, line: line});
		}
		else {
			for(i=0; i<len; i++){
				pos = i;
				if(handlers[event][i].priority <= priority){
					break;
				}
			}
			handlers[event].splice(pos, 0, {fn: callback, priority: priority, line: line});
		}
	}
};


function test(cb){
	var t = (typeof cb == "function");
	console.log("++++++++++++++++", t);
	return t;
}
