/* jshint browser: true */
/* global $ */

/*
 - Email digest frequency (Daily/Weekly, Never)
 - Email me when I"m mentioned in a room (On/Off)
*/
var formField = require("../ui/utils/form-field.js");

module.exports = function(core) {
	core.on("pref-show", function(tabs, next) {
		var user = tabs.user,
			$div = $("<div>");

		user.params.email = user.params.email || {};
		user.params.email.frequency = user.params.email.frequency || "daily";

		if (typeof user.params.email.notifications !== "boolean") {
			user.params.email.notifications = true;
		}

		$div.append(formField("Mention notifications via email", "toggle", "mention", user.params.email.notifications));

		switch (user.params.email.frequency) {
			case "daily":
				$div.append(formField("Email digest frequency", "radio", "email-freq", [["email-freq-daily", "Daily", true], ["email-freq-never", "Never"]]));
				break;
			case "never":
				$div.append(formField("Email digest frequency", "radio", "email-freq", [["email-freq-daily", "Daily"], ["email-freq-never", "Never", true]]));
				break;
			default:
				$div.append(formField("Email digest frequency", "radio", "email-freq", [["email-freq-daily", "Daily", true], ["email-freq-never", "Never"]]));
		}

		tabs.email = {
			text: "Email",
			html: $div
		};

		next();
	}, 600);

	core.on("pref-save", function(user, next) {
		user.params.email = {
			frequency: $("input:radio[name='email-freq']:checked").next().text().toLowerCase(),
			notifications: $("#mention").is(":checked")
		};

		next();
	}, 500);
};
