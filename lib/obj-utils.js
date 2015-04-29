function merge(obj1, obj2) {
	var frozen = false;

	if (obj1 === null || typeof obj1 !== "object" || typeof obj2 !== "object") {
		return obj2;
	}

	if (Array.isArray(obj1)) {
		return obj2;
	}

	if (Object.isFrozen(obj1)) {
		frozen = true;

		obj1 = clone(obj1);
	}

	for (var name in obj2) {
		if (obj2[name] === null) {
			obj1[name] = null;
		//	delete obj1[name];
		} else if (typeof obj1[name] === "object" && typeof obj2[name] === "object" && obj1[name] !== null) {
			obj1[name] = merge(obj1[name], obj2[name]);
		} else {
			obj1[name] = obj2[name];
		}
	}

	return frozen ? deepFreeze(obj1) : obj1;
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

	return obj;
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

function deepFreeze(o) {
	var prop;

	if (typeof o !== "object" || o === null) {
		return o;
	}

	if (!Object.isFrozen(o)) {
		Object.freeze(o); // First freeze the object.
	}

	for (var key in o) {
		prop = o[key];

		if (!o.hasOwnProperty(key) || (typeof prop !== "object") || (prop === null) || Object.isFrozen(prop)) {
			// If the object is on the prototype, not an object, or is already frozen,
			// skip it. Note that this might leave an unfrozen reference somewhere in the
			// object if there is an already frozen object containing an unfrozen object.
			continue;
		}

		deepFreeze(prop); // Recursively call deepFreeze.
	}

	return o;
}

module.exports = {
	clone: clone,
	get: get,
	merge: merge,
	equal: equal,
	deepEqual: deepEqual,
	deepFreeze: deepFreeze
};
