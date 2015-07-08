"use strict";

var objUtils = require("./obj-utils.js");

module.exports = function(objs, opts, grouper) {
	var grouped = opts && Array.isArray(opts.base) ? opts.base : [],
		groups = {},
		count, items, obj, group;

	if (!((typeof objs === "object" && objs !== null) || Array.isArray(objs))) {
		throw new TypeError("Invalid list of objects given");
	}

	if (!(opts && typeof opts.max === "number")) {
		throw new TypeError("No maximum value specified");
	}

	if (typeof grouper !== "function") {
		grouper = function(item) {
			return item.group;
		};
	}

	if (Array.isArray(objs)) {
		for (var i = 0, l = objs.length; i < l; i++) {
			obj = objs[i];

			group = grouper(obj);

			if (group) {
				if (groups[group]) {
					groups[group].push(obj);
				} else {
					groups[group] = [ obj ];
				}
			}
		}
	} else {
		for (var o in objs) {
			obj = objs[o];

			group = grouper(obj);

			if (group) {
				if (groups[group]) {
					groups[group].push(obj);
				} else {
					groups[group] = [ obj ];
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

		if (count > opts.max) {
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
