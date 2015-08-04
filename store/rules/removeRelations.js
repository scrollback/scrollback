"use strict";

module.exports = function (core, config, store) {
	core.on('setstate', function (changes) {
		var ru, role, status;
		if(changes.entities) {
				for(ru in changes.entities) {
				if(!changes.entities[ru] || ru.indexOf('_') < 0) continue;

				role = typeof changes.entities[ru].role === 'undefined'? store.get('entities', ru, 'role'): changes.entities[ru].role;
				status = typeof changes.entities[ru].status === 'undefined'? store.get('entities', ru, 'status'): changes.entities[ru].status;

				if(role && role !== 'none') continue;
				if(status && status !== 'offline') continue;
				changes.entities[ru] = null;
			}
		}
	}, 300);
};
