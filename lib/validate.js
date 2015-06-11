"use strict";

var Validator = require("./validator.js");

module.exports = function(name) {
	var validator = new Validator(name);

	return {
		isValid: validator.isValid(),
		sanitized: validator.sanitize(),
		error: validator.getErrorString() || false
	};
};
