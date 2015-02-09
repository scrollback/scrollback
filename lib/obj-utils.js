function clone(obj) {
	var tmp;

	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (obj instanceof Array) {
		tmp = [];

		for (var i = 0, l = obj.length; i < l; i++) {
			tmp.push(clone(obj[i]));
		}

		return tmp;
	}

	tmp = {};

	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			tmp[key] = clone(obj[key]);
		}
	}

	return tmp;
}

function get(obj) {
	var keys = Array.prototype.slice.call(arguments, 1),
		val = clone(obj);

	for (var i = 0, l = keys.length; i < l; i++) {
		if (val === null || typeof val !== "object") {
			return;
		}

		val = val[keys[i]];
	}

	return val;
}

module.exports = {
	clone: clone,
	get: get
};
