"use strict";
/* global require, module */

module.exports = function(core, config) {
	/*require("./originban/originban.js")(core);
	require("./repeatban/repeatban.js")(core);
	require("./usernameban/usernameban.js")(core);*/
	// require("./wordban/wordban.js")(core, config);
	require("./wordban/wordban.js")(core, config);
};
