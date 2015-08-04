"use strict";

var log = require("../lib/logger.js"),
	send = require("./sendEmail.js"),
	fs = require("fs"),
	handlebars = require("handlebars"),
	config, defaultTemplate;


/**
 * send welcome mail to user
 *@param {Object} user
 */

function sendWelcomeEmail(user, origin) {
	function useTemplate(template) {
		var emailHtml = template(user);
		var emailAdd = false,
			i;

		for (i = 0; i < user.identities.length; i++) {
			if (user.identities[i].indexOf("mailto:") === 0) {
				emailAdd = user.identities[i].substring(7);
				break;
			}
		}
		
		log.d("email add", user, emailAdd);
		if (emailAdd) {
			log.i("sending welcome email.", emailAdd);
			send(config.from, emailAdd, "Welcome to Scrollback", emailHtml);
		}
	}

	fs.readFile(__dirname + "/views/" + origin.host + ".hbs", "utf8", function(err, data) {
		var template;
		if (err) return useTemplate(defaultTemplate);
		template = handlebars.compile(data.toString());
		useTemplate(template);
	});
}


/**
 * Listen to Room Event
 * @param coreObject
 */

function emailRoomListener(action, callback) {
	log("user welcome email ", action);

	if (!action.old.id) {
		// user signed up
		sendWelcomeEmail(action.user, action.origin);
	}

	callback();
}

function init() {
	fs.readFile(__dirname + "/views/welcome-email.hbs", "utf8", function(err, data) {
		if (err) throw err;

		defaultTemplate = handlebars.compile(data.toString());
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
