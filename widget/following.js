module.exports = function(self) {
	return function() {
		var following = {}, callback;
		
		
		if(!arguments[0] && arguments.length!== 1) throw new Error("INVALID ARGUMENTS: invalid argument count");
		if(typeof arguments[0] !== "string") throw new Error("INVALID ARGUMENTS: room name must be string. instead found it to be" + typeof arguments[0]);
		
		/*if (arguments.length >= 3) {
			throw new Error("INVALID ARGUMENTS: Too many arguments");
		} else if (arguments.length == 2) {
			if (typeof arguments[0] == "string" && typeof arguments[1] == "boolean") {
				room = arguments[0];
				follow = arguments[1];
			} else if (typeof arguments[0] == "boolean" && typeof arguments[1] == "function") {
				room = self.state.roomName;
				follow = arguments[0];
				callback = arguments[1];
			} else {
				throw new Error("INVALID ARGUMENTS: Check argument type");
			}
		} else {
			if (typeof arguments[0] == "boolean") {
				room = self.state.roomName;
				follow = arguments[0];
			} else {
				room = arguments[0] || self.state.roomName;
				return (self.membership.indexOf(room) >= 0);
			}
		}*/

		following = {
			room: arguments[0],
			follow: true
		};
		self.emit("following", following, callback);
	};
};