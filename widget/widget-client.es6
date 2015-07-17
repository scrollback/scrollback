/* eslint-env es6 */

"use strict";

module.exports = (...args) => {
	require("./widget-bridge.js")(...args);
	require("./set-statusbar-color.es6")(...args);
};
