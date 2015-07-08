"use strict";

var objUtils = require("./obj-utils.js");

module.exports = function(objs, max, base) {
	var grouped = Array.isArray(base) ? base : [],
		groups = {},
		count, items, obj;

	if (Array.isArray(objs)) {
		for (var i = 0, l = objs.length; i < l; i++) {
			obj = objs[i];

			if (obj.group) {
				if (groups[obj.group]) {
					groups[obj.group].push(obj);
				} else {
					groups[obj.group] = [ obj ];
				}
			}
		}
	} else {
		for (var o in objs) {
			obj = objs[o];

			if (obj.group) {
				if (groups[obj.group]) {
					groups[obj.group].push(obj);
				} else {
					groups[obj.group] = [ obj ];
				}
			}
		}
	}

	for (var g in groups) {
		items = groups[g];
		count = 0;

		for (var j = 0, m = items.length; j < m; j++) {
			if (items[j].count) {
				count += items[j].count;
			} else {
				count++;
			}
		}

		if (count > max) {
			obj = items[items.length - 1];

			if (obj.count !== count) {
				obj = objUtils.clone(obj);

				obj.count = count;
			}

			grouped.push(obj);
		} else {
			for (var k = 0, n = items.length; k < n; k++) {
				grouped.push(items[k]);
			}
		}
	}

	return grouped;
};
