"use strict";

module.exports = (...args) => {
	require("./widget-bridge.js")(...args);
	require("./widget-config.js")(...args);
	require("./set-statusbar-color.js")(...args);
//	require("./user-domain-blacklist.js")(...args);
	require("./app-compatibility-helper.js")(...args);
};
