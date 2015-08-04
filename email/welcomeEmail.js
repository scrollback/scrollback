"use strict";

var log = require("../lib/logger.js"),
	send = require("./sendEmail.js"),
	fs = require("fs"),
	handlebars = require("handlebars"),
	config, template;


/**
 * send welcome mail to user
 *@param {Object} user
 */

function sendWelcomeEmail(user) {
	var emailHtml = template(user),
		emailAdd = false;

	user.identities.forEach(function(u) {
		if (u.indexOf("mailto:") === 0) {
			emailAdd = u.substring(7);
		}
	});

	log("email add", user, emailAdd);

	if (emailAdd) {
		log("sending welcome email.", emailAdd);
		send(config.from, emailAdd, "Welcome to Scrollback", emailHtml);
	}
}


/**
 * Listen to Room Event
 * @param coreObject
 */

function emailRoomListener(action, callback) {
	log("user welcome email ", action);

	if (!action.old.id) {
		// user signed up
		sendWelcomeEmail(action.user);
	}

	callback();
}

function init() {
	fs.readFile(__dirname + "/views/welcome-email.hbs", "utf8", function(err, data) {
		if (err) throw err;

		template = handlebars.compile(data.toString());
	});
}

module.exports = function(core, conf) {
	config = conf;

	if (config.email && config.email.auth) {
		init();

		core.on("user", emailRoomListener, "gateway");
	} else {
		log("email module is not enabled");
	}

};
