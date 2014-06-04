var formField = require('../lib/formField.js');

libsb.on('config-show', function(tabs, next){
    var results = tabs.room; 
    var div = $('<div>').addClass('list-view list-view-irc-settings');
    var displayString = "";
    div.append(formField("IRC Server", "text", "ircserver", results.params.irc.server), formField("IRC Channel", "text", "ircchannel", results.params.irc.channel));
    if(results.params.irc){
        if(results.params.irc.server && results.params.irc.channel && results.params.irc.pending) {
            $.get('/r/irc/' + results.id, function(botName) {
                displayString = "The IRC channel operator needs to type \"/msg " + botName + " connect " + results.params.irc.channel + " " + results.id + "\" in the irc channel.";
                div.append($('<div class="settings-item"><div class="settings-label"></div><div class="settings-action" id="roomAllowed">' + displayString + '</div></div>'));
            });
        } else if (results.params.irc.server && results.params.irc.channel) {
            displayString = "Connected to irc channel: " + results.params.irc.channel;
            div.append($('<div class="settings-item"><div class="settings-label"></div><div class="settings-action" id="roomAllowed">' + displayString + '</div></div>'));
        } else {
            displayString = "Not connected to any channel";
            div.append($('<div class="settings-item"><div class="settings-label"></div><div class="settings-action" id="roomAllowed">' + displayString + '</div></div>'));
        }

    }
    tabs.irc = {
            html: div,
            text: "IRC setup",
            prio: 800
    };
    next();
});

libsb.on('config-save', function(room, next){
    room.params.irc = {
        server : $('#ircserver').val(),
        channel : $('#ircchannel').val()
    };
    if(room.params.irc && room.params.irc.channel && room.params.irc.server) {
		var ircIdentity = "irc://" + room.params.irc.server +  ":" + room.params.irc.channel;
		if (!room.identities) room.identities = [];
		room.identities.push(ircIdentity);
    }
    next();
});

libsb.on("room-dn", function(room, next) {
	console.log("room:", room);
	var r = room.room;
	$.get('/r/irc/' + r.id, function(botName) {
        displayString = "The IRC channel operator needs to type \"/msg " + botName + " connect " + r.params.irc.channel + " " + r.id + "\" in the irc channel.";
        lace.alert.show({type: "success", body: displayString});
    });
	next();
});
console.log("error event reg");
libsb.on("error-dn", function(reply, next) {
	console.log("err:", reply);
	if (reply.message === "ERR_CONNECTED_OTHER_ROOM") {
		lace.alert.show({type: "error", body: "IRC channel is already connected to some other room"});
	}
	next();
});

