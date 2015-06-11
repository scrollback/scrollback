"use strict";

var ValidatorClient = require("../../lib/validator-client.es6");

module.exports = core => {
	return function(type, name, callback) {
		if (typeof callback !== "function") {
			return;
		}

		name = (typeof name === "string") ? name.toLowerCase().trim() : "";

		callback("wait");

		let validator = new ValidatorClient(name, core);

		if (!validator.isValid()) {
			let message;

			if (validator.error === "ERR_VALIDATE_REQUEST") {
				message = "An error occured. May be try later?";
			} else if (validator.error === "ERR_VALIDATE_EXISTS") {
				message = name + " is not available. May be try another?";
			} else {
				message = type + " " + validator.getErrorString();
			}

			callback("error", message);
		} else {
			callback("ok", name);
		}
	};
};
