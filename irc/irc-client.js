/* jshint browser: true */
/* global $, libsb */

var lace = require("../lib/lace.js"),
    formField = require("../lib/formField.js");

libsb.on('config-show', function(tabs, next){
    var results = tabs.room,
        $div = $('<div>'),
        displayString = "",
        ircServer = "",
        ircChannel = "", notify = {};

    if(results.params.irc && results.params.irc.server && results.params.irc.channel){
        ircServer = results.params.irc.server;
        ircChannel = results.params.irc.channel;
    }

    $div.append(formField("IRC Server", "text", "ircserver", ircServer), formField("IRC Channel", "text", "ircchannel", ircChannel));

    if(results.params.irc){
        if(results.params.irc.error) {
            notify.type = "error";
            notify.value = null;
            if(results.params.irc.error == "ERR_CONNECTED_OTHER_ROOM") {
                displayString = "This IRC account is already linked with another room. Try a different server.";    
            }else
                displayString = "Error in saving, please try again after some time";    
            }
            
        } else if(results.params.irc.server && results.params.irc.channel && results.params.irc.pending) {
            notify.type = "info";
            notify.value = null;

            $.get('/r/irc/' + results.id, function(botName) {
                displayString = "The IRC channel operator needs to type \"/msg " + botName + " connect " + results.params.irc.channel + " " + results.id + "\" in the irc channel.";
            });
        } else if ((results.params.irc.server && results.params.irc.channel)) {
            displayString = "Connected to irc channel: " + results.params.irc.channel;
        } else {
            displayString = "Not connected to any channel";
        }

        $div.append(formField("", "", "", displayString));
    

    tabs.irc = {
        text: "IRC integration",
        html: $div,
        prio: 800,
        notify: notify
    };
    next();
}, 500);

libsb.on('config-save', function(room, next){
    room.params.irc = {
        server : $('#ircserver').val(),
        channel : $('#ircchannel').val()
    };

    if(room.params.irc && room.params.irc.channel && room.params.irc.server) {
		var ircIdentity = "irc://" + room.params.irc.server +  "/" + room.params.irc.channel;
		if (!room.identities) room.identities = [];
		room.identities.push(ircIdentity);
    }

    next();
}, 500);

/*libsb.on("room-dn", function(action, next) {
    var room = action.room;
    if(action.user.id != libsb.user.id || !room.params || !room.params.irc) return next();

    if (!room.params.irc.error && room.params.irc.server && room.params.irc.channel) {
		var r = room;

		$.get('/r/irc/' + r.id, function(botName) {
			var displayString = "Something went wrong while connecting to IRC server";
			if(botName !== 'ERR_NOT_CONNECTED') displayString = "The IRC channel operator needs to type \"/msg " + botName + " connect " + r.params.irc.channel + " " + r.id + "\" in the irc channel.";
			lace.alert.show({type: "success", body: displayString, timeout: 3000});
		});
	}

	next();
});*/

libsb.on("error-dn", function(reply, next) {
	var displayString;

	if (reply.message === "ERR_CONNECTED_OTHER_ROOM") {
		displayString = "IRC channel is already connected to some other room";
	} else if (reply.message === "ERR_IRC_NOT_CONNECTED") {
		displayString = "We are facing some issue with our irc client please try again after some time";
	}

	if(displayString) lace.alert.show({type: "error", body: displayString});

	next();
}, 500);
