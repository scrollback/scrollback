/* jshint browser: true */

// Check if the array contains a value
Array.prototype.contains = function (value) {
	var i;

	for (i in this) {
		if (this[i] === value) {
			return true;
		}
	}

	return false;
};
