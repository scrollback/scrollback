"use strict";

var errorStrings = require("./validator-strings.js");

function Validator(name) {
	this.name = name;
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

	if (this.error === null) {
		for (var i = 0, l = Validator.reservedWords.length; i < l; i++) {
			if (name === Validator.reservedWords[i]) {
				this.error = "ERR_VALIDATE_RESERVED";

				break;
			}
		}
	}

	if (this.error === null && this.sanitize() !== name) {
		this.error = "ERR_VALIDATE";
	}
}

Validator.reservedWords = [ "undefined", "null", "room", "user", "admin", "owner", "root", "sdk", "css", "img" ];

Validator.prototype.isValid = function() {
	return this.error === null;
};

Validator.prototype.getErrorString = function(lang) {
	lang = typeof lang === "string" ? lang : "en";

	if (this.error && errorStrings[lang] && this.error in errorStrings[lang]) {
		return errorStrings[lang][this.error];
	} else {
		return "";
	}
};

Validator.prototype.sanitize = function(opts) {
	var room = typeof this.name === "string" ? this.name : "";

	room = room.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/, "").trim();

	if (/^[0-9]*$/.test(room)) {
		room = "";
	}

	if (room === "" && opts && opts.defaultRoom) {
		room = opts.defaultRoom;
	} else if (room.length < 3) {
		room = room + Array(4 - room.length).join("-");
	} else if (opts && opts.defaultRoom) {
		for (var i = 0, l = Validator.reservedWords.length; i < l; i++) {
			if (room === Validator.reservedWords[i]) {
				room = opts.defaultRoom;

				break;
			}
		}
	}

	return room.slice(0, 32);
};

module.exports = Validator;
