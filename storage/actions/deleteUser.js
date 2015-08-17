"use strict";

module.exports = function(action) {
	return [{
		$: "delete from entities where id=${id}",
		id: action.user.id
	}];
};
