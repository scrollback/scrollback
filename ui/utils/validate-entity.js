/* jshint browser: true */

var validate = require("../../lib/validate.js");

module.exports = function(core) {
	function checkExisting(name, callback) {
		core.emit("getRooms", {
			ref: name
		}, function(err, res) {
			if (res && res.results && res.results.length) {
				return callback(true);
			}

			core.emit("getUsers", {
				ref: name
			}, function(err, res) {
				if (res && res.results && res.results.length) {
					return callback(true);
				}

				return callback(false);
			});
		});
	}

	function validateEntity(type, name, callback) {
		var validation;

		if (typeof callback === "function") {
			callback = function() {};
		}

		name = (typeof name === "string") ? name.toLowerCase().trim() : "";

		validation = validate(name);

		if (!validation.isValid) {
			return callback("error", type + " " + validation.error);
		}

		callback("wait");

		checkExisting(name, function(isTaken) {
			if (isTaken) {
				return callback("error", name + " is not available. May be try another?");
			} else {
				return callback("ok", name);
			}
		});
	}

	return validateEntity;
};
