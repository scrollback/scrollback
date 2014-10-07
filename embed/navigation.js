module.exports = function (self) {
	return function() {
	
		if(arguments.length === 0) return self.state || {};
		s = arguments[0];
		console.log("Emitting navigate", s);
		if(arguments[1]) {
			self.emit("navigate", s, arguments[1]);
		}else{
			self.emit("navigate", s);
		}
		
	};
};