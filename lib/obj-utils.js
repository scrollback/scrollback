function extendObj(obj1, obj2) {
	if (typeof obj1 !== "object" || typeof obj2 !== "object") {
		return clone(obj1);
	}
	
	if(obj1 instanceof Array) {
		return clone(obj2);
	}

	for (var name in obj2) {
		if (obj2[name] === null) {
			delete obj1[name];
		} else if (typeof obj1[name] === "object" && typeof obj2[name] === "object" && obj1[name] !== null) {
			obj1[name] = extendObj(obj1[name], obj2[name]);
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
	var keys = Array.prototype.slice.call(arguments, 1);

	for (var i = 0, l = keys.length; i < l; i++) {
		if (obj === null || typeof obj !== "object") {
			return;
		}

		obj = obj[keys[i]];
	}

	return clone(obj);
}

module.exports = {
	clone: clone,
	get: get,
	extend: extendObj
};
