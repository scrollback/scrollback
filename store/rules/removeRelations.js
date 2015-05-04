"use strict";

module.exports = function (core, config, store) {
	core.on('setstate', function (changes, next) {
		var ru, role, status;
		if(changes.entities) for(ru in changes.entities) {
			if(ru.indexOf('_') < 0) return next();
			role = typeof changes.entities[ru].role === 'undefined'? store.get('entities', ru, 'role'): changes.entities[ru].role;
			status = typeof changes.entities[ru].status === 'undefined'? store.get('entities', ru, 'status'): changes.entities[ru].status;
			if(role && role !== 'none') return next();
			if(status && status !== 'offline') return next();
			changes.entities[ru] = null;
		}
		next();
	}, 300);
};
