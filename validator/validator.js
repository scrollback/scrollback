/* global require, module */

module.exports = function(core) {
	require("./messagevalidation/messagevalidation.js")(core);
	require("./roomvalidation/roomvalidation.js")(core);
};
