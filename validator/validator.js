/* global require, module */

module.exports = function(core, config) {
	require("./actionvalidator/actionvalidator.js")(core, config);
};
