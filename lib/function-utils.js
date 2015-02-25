var math = require('./math-utils.js');

module.exports = {
	execFunctionsAfterSometime: function(fns, time) {
		if (typeof fns === 'function') {
			fns = [fns];
		}
		fns.forEach(function(fn) {
			setTimeout(fn, math.random(0, time));
		});
	}
};
