"use strict";

function escape(reg) {
	return reg.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}

module.exports = {
	escape: escape
};
