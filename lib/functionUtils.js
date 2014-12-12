var math = require('./mathUtils.js');
module.exports = {
	execFunctions: function(fns, time) {
		if (typeof fns === 'function') {
			fns = [fns];
		}
		fns.forEach(function(fn) {
			setTimeout(fn, math.random(0, time));
		});
	}
};