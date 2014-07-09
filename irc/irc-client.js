/* jshint browser: true */
/* global $, libsb */

var formField = require("../lib/formField.js");
var lace = require('../lib/lace.js');
libsb.on('config-show', function (tabs, next) {
	var results = tabs.room,
		$div = $('<div>'),
		displayString = "",
		ircServer = "",
		ircChannel = "",
		notify = {},
		enabled = true;

	if (results.params.irc && results.params.irc.server && results.params.irc.channel) {
		ircServer = results.params.irc.server;
		ircChannel = results.params.irc.channel;
		enabled = results.params.irc.enabled;
	}
	$div.append(formField("IRC Server", "text", "ircserver", ircServer), formField("IRC Channel", "text", "ircchannel", ircChannel));
	$div.append(formField("Enable irc", "toggle", "ircenabled", enabled));
	var isNext = false;
	if (results.params.irc) {
		var ircParams = results.params.irc;
		if (ircParams.error) {
			notify.type = "error";
			notify.value = null;
			if (results.params.irc.error === "ERR_CONNECTED_OTHER_ROOM") {
				displayString = "This IRC account is already linked with another scrollback room. You can't use it until they unlink.";
			} else {
				displayString = "Error in saving, please try again after some time";
			}

		} else if (ircParams.server && ircParams.channel && ircParams.pending && ircParams.enabled) {
			notify.type = "info";
			notify.value = null;

			$.get('/r/irc/' + results.id, function (botName) {
				displayString = "The IRC channel operator needs to type \"/invite " + botName + " " + results.params.irc.channel +
					"\" in the irc channel to complete the process.";
				$div.append($('<div class="settings-item"><div class="settings-label"></div><div class="settings-action" id="roomAllowed">' + displayString + '</div></div>'));
				next();
			});

		} else if (results.params.irc.server && results.params.irc.channel && results.params.irc.enabled) {
			displayString = "Connected to irc channel: " + results.params.irc.channel;
		} else {
			displayString = "Not connected.";
		}

		$div.append(formField("", "", "", displayString));
	}

	tabs.irc = {
		text: "IRC integration",
		html: $div,
		prio: 800,
		notify: notify
	};

	if (!isNext) next();
}, 500);


libsb.on('config-save', function (room, next) {
	room.params.irc = {
		server: $('#ircserver').val(),
		channel: $('#ircchannel').val(),
		enabled: $('#ircenabled').is(':checked')
	};

	if (room.params.irc && room.params.irc.channel && room.params.irc.server) {
		var ircIdentity = "irc://" + room.params.irc.server + "/" + room.params.irc.channel;
		if (!room.identities) room.identities = [];
		room.identities.push(ircIdentity);
	}

	next();
}, 500);

libsb.on("room-dn", function (room, next) {
	var r = room.room;
	var irc = r.params.irc;
	if (room.user.id === libsb.user.id && irc && irc.pending && !irc.error && irc.channel && irc.server && irc.enabled) {
		$.get('/r/irc/' + r.id, function (botName) {
			var displayString = "Something went wrong while connecting to IRC server";
			if (botName !== 'ERR_NOT_CONNECTED') displayString = "The IRC channel operator needs to type \"/invite " + botName +
				" " + r.params.irc.channel + "\" in the irc channel to complete the process.";
			lace.alert.show({
				type: "info",
				body: displayString
			});
		});
	}
	next();
}, 500);