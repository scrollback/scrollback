/* global require, module */

module.exports = function(core) {
	require("./actionvalidator/actionvalidator.js")(core);
	require("./roomvalidation/roomvalidation.js")(core);
};
