/* eslint-env es6 */

"use strict";

module.exports = (...args) => {
	require("./notification-handler.es6")(...args);
	require("./desktop-notifications.es6")(...args);
	require("./titlebar-ticker.es6")(...args);
}
