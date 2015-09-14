"use strict";

module.exports = (...args) => {
	require("./notification-handler.js")(...args);
	require("./desktop-notifications.js")(...args);
	require("./titlebar-ticker.js")(...args);
};
