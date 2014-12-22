module.exports = {
	random: function() {
		var lowBound, upBound;
		if (!arguments.length) {
			return Math.random();
		} else if (arguments.length == 1) {
			lowBound = 0;
			upBound = arguments[0];
		} else {
			lowBound = arguments[0];
			upBound = arguments[1]
		}

		return Math.floor(Math.random() * (upBound - lowBound)) + lowBound;
	}
};