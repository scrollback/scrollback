/* global require, module */

module.exports = function(core) {
	require("./originban/originban.js")(core);
	require("./repeatban/repeatban.js")(core);
	require("./usernameban/usernameban.js")(core);
	require("./wordban/wordban.js")(core);
};
