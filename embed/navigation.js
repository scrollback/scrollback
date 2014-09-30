module.exports = function (self) {
	return function() {
		if(arguments.length === 0) return self.state || {};
		s = arguments[0];
		if(arguments[1]) cb = arguments[1];
		self.emit("navigate", s, cb);
	};
};