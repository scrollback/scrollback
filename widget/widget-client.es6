/* eslint-env es6 */

"use strict";

module.exports = (...args) => {
	require("./widget-bridge.js")(...args);
	require("./widget-config.js")(...args);
	require("./set-statusbar-color.es6")(...args);
	require("./user-domain-blacklist.js")(...args);
};
