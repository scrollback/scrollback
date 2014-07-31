/* jshint browser: true */
/* global $, libsb */

/*
 - Email digest frequency (Daily/Weekly, Never)
 - Email me when I'm mentioned in a room (On/Off)
*/
var formField = require('../lib/formField.js');

libsb.on('pref-show', function (tabs, next) {
    //email
    var user = tabs.user;

    var $div = $('<div>');

    if (!user.params.email) user.params.email = {};
    if (typeof user.params.email.notifications === "undefined") user.params.email.notifications = true;
    if (typeof user.params.email.frequency === "undefined") user.params.email.frequency = "daily";
    $div.append(formField("Mention notifications via email", "toggle", "mention", user.params.email.notifications));

    switch (user.params.email.frequency) {
		case 'daily':
			$div.append(formField("Email digest frequency", 'radio', 'email-freq', [["email-freq-daily", "Daily", true], ["email-freq-never", "Never"]]));
			break;
		case 'never':
			$div.append(formField("Email digest frequency", 'radio', 'email-freq', [["email-freq-daily", "Daily"], ["email-freq-never", "Never", true]]));
			break;
		default:
			$div.append(formField("Email digest frequency", 'radio', 'email-freq', [["email-freq-daily", "Daily", true], ["email-freq-never", "Never"]]));
    }

    tabs.email = {
        text: "Email",
        html: $div,
        prio: 900
    };

    next();
}, 500);

libsb.on('pref-save', function (user, next) {
    user.params.email = {
        frequency: $('input:radio[name="email-freq"]:checked').next().text().toLowerCase(),
        notifications: $('#mention').is(':checked')
    };

    next();
}, 500);
