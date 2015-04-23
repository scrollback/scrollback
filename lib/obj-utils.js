function extend(obj1, obj2) {
	if (typeof obj1 !== "object" || typeof obj2 !== "object") {
		return obj1;
	}

	if (Array.isArray(obj1)) {
		return clone(obj2);
	}

	for (var name in obj2) {
		if (obj2[name] === null) {
			obj1[name] = null;
		//	delete obj1[name];
		} else if (typeof obj1[name] === "object" && typeof obj2[name] === "object" && obj1[name] !== null) {
			obj1[name] = extend(obj1[name], obj2[name]);
		} else {
			obj1[name] = clone(obj2[name]);
		}
	}

	return obj1;
}

function clone(obj) {
	var tmp;

	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (Array.isArray(obj)) {
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
	var keys = Array.prototype.slice.call(arguments, 1);

	for (var i = 0, l = keys.length; i < l; i++) {
		if (obj === null || typeof obj !== "object") {
			return;
		}

		obj = obj[keys[i]];
	}

	return clone(obj);
}

function equal(o1, o2) {
	if (typeof o1 !== "object" || typeof o2 !== "object" || o1 === null || o2 === null) {
		return o1 === o2;
	}

	if (Object.keys(o1).length !== Object.keys(o2).length) {
		return false;
	}

	for (var k in o1) {
		if (o1[k] !== o2[k]) {
			return false;
		}
	}

	return true;
}

function deepEqual(o1, o2) {
	if (typeof o1 !== "object" || typeof o2 !== "object" || o1 === null || o2 === null) {
		return o1 === o2;
	}

	if (Object.keys(o1).length !== Object.keys(o2).length) {
		return false;
	}

	for (var k in o1) {
		if (typeof o1[k] === "object" && typeof o2[k] === "object") {
			return deepEqual(o1[k], o2[k]);
		}
	}

	return true;
}

module.exports = {
	clone: clone,
	get: get,
	extend: extend,
	equal: equal,
	deepEqual: deepEqual
};
