/* global require, module */

module.exports = function(core) {
	require("./roomauth/roomauth.js")(core);
	require("./loginrequired/loginrequired.js")(core);
};
