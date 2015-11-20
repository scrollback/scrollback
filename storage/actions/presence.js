"use strict";

module.exports = function(action) {
	return [{
		$: "update entities set lastseentime=NOW() where id=${id}",
		id: action.user.id.replace(/^guest-/,"")
	}];
};
