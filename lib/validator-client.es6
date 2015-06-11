/* eslint-env es6 */

"use strict";

const Validator = require("./validator.js");

class ValidatorClient extends Validator {
	constructor(name, core) {
		super(name);

		if (this.error !== null) {
			core.emit("getEntities", { ref: name }, (err, res) => {
				if (err) {
					this.error = "ERR_VALIDATE_REQUEST";
				}

				if (res && res.results && res.results.length) {
					this.error = "ERR_VALIDATE_EXISTS";
				}
			});
		}
	}
}

module.exports = ValidatorClient;
