"use strict";

var errorStrings = require("./validator-strings.js");

function Validator(name) {
	// Handle situation where called without "new" keyword
	if (false === (this instanceof Validator)) {
		throw new Error("Must be initialized before use");
	}

	this._name = name;
	this.error = null;

	if (typeof name !== "string") {
		this.error = "ERR_VALIDATE_TYPE";
	} else if (name === "") {
		this.error = "ERR_VALIDATE_EMPTY";
	} else if (/[^0-9a-z\-]/.test(name)) {
		this.error = "ERR_VALIDATE_CHARS";
	} else if (name.length < 3) {
		this.error = "ERR_VALIDATE_LENGTH_SHORT";
	} else if (name.length > 32) {
		this.error = "ERR_VALIDATE_LENGTH_LONG";
	} else if (/^[^a-z0-9]/.test(name)) {
		this.error = "ERR_VALIDATE_START";
	} else if (/^[0-9]+$/.test(name)) {
		this.error = "ERR_VALIDATE_NO_ONLY_NUMS";
	}

	if (this.error === null && Validator.reservedWords.indexOf(name) > -1) {
		this.error = "ERR_VALIDATE_RESERVED";
	}
}

Validator.reservedWords = [ "undefined", "null", "room", "user", "admin", "owner", "root", "sdk", "css", "img" ];

Validator.prototype.isValid = function() {
	return this.error === null;
};

Validator.prototype.getErrorString = function(lang) {
	lang = typeof lang === "string" && errorStrings[lang] ? lang : "en";

	if (this.error && this.error in errorStrings[lang]) {
		return errorStrings[lang][this.error];
	} else {
		return "";
	}
};

Validator.prototype.sanitize = function(opts) {
	var name;

	if (this.isValid()) {
		return this._name;
	}

	if (typeof this._name === "string") {
		name = this._name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/, "").trim();

		if (/^[0-9]+$/.test(name)) {
			name = "";
		}
	} else {
		name = "";
	}

	if (name === "" || Validator.reservedWords.indexOf(name) > -1) {
		name = (opts && typeof opts.defaultName === "string") ? opts.defaultName : "";
	}

	if (name.length < 3) {
		name = name + Array(4 - name.length).join("-");
	}

	return name.slice(0, 32);
};

module.exports = Validator;
