/* jshint browser: true */
/* global libsb, $ */

function formField(label, type, id) {
	var input;

	switch(type) {
		case 'area':
			input = "<textarea id='" + id + "' name='" + id + "'></textarea>";
			break;
		case 'text':
			input = "<input type='text' id='" + id + "' name='" + id + "'>";
			break;
		case 'checks':
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					input = "<input type='checkbox' id='" + id[i][0] + "' name='" + id[i][0] + "'><label for='" + id[i][0] +"'>" + id[i][1] + "</label>";
				}
			} else {
				input = "<input type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'>" + label + "</label>";
			}
			break;
		case 'toggle':
			input = "<input class='switch' type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'>" + label + "</label>";
			break;
		case 'segmented':
			input = "<span class='entry segmented' id='" + id + "'><span contenteditable class='segment'></span></span>";
			break;
	}

	return "<div class='settings-item'><div class='settings-label'>" + label + "</div><div class='settings-action'>" + input + "</div></div>";
}

// General
libsb.on('config-show', function(conf, next) {
	conf.general = "<div class='pane pane-general-settings'>" + formField("Name", "text", "displayname") + formField("Description", "area", "description") + "</div>";

	next();
});

// IRC integration
libsb.on('config-show', function(conf, next) {
	conf.irc = "<div class='pane pane-irc-settings'>" + formField("IRC Server", "text", "ircserver") + formField("IRC Channel", "text", "ircchannel") + "</div>";

	next();
});

// Twitter integration
libsb.on('config-show', function(conf, next) {
	var $twitteruser = "<div class='settings-label'>Signed in as <a href='https://twitter.com/" + "satya164" + ">" + "satya164" + "</a></div><div class='settings-action'><a href='https://twitter.com/" + "satya164" + " class='twitter-account'><img src='" + "" + "' alt=" + "satya164" + "><span class='change'>Change</span></a></div>";

	$(".twitter-account").click(function() {
		// do stuff here!
	});

	conf.twitter = "<div class='pane pane-twitter-settings'>" + formField("Hashtags", "segmented", "twitterhashtags") + $twitteruser + "</div>";

	next();
});

// Threading
libsb.on('config-show', function(conf, next) {
	conf.thread = "<div class='pane pane-thread-settings'>" + formField("Group messages into threads", "toggle", "threading") + "</div>";

	next();
});

// Permissions
libsb.on('config-show', function(conf, next) {
	conf.permissions = "<div class='pane pane-permissions-settings'>" + formField("Who can read messages", "checks", [ [ "read-guests", "Guests" ], [ "read-visitors", "Visitors" ], [ "read-followers", "Followers" ] ]) + formField("Who can post messages", "checks", [ [ "write-guests", "Guests" ], [ "write-visitors", "Visitors" ], [ "write-followers", "Followers" ] ]) + formField("Require approval for following", "toggle", "follow-request") + "</div>";

	next();
});

// Requests
libsb.on('config-show', function(conf, next) {
	var $requests = '<div class="request-msg"><img src="s/img/avatars/Keith.jpg" alt=""><div class="request-details"><div class="username"><a href="">randomdude</a></div><a class="button">Approve</a><a class="button-secondary">Ignore</a></div></div>';

	conf.requests = "<div class='pane pane-requests-settings'>" + $requests + "</div>";

	next();
});

// Spam control
libsb.on('config-show', function(conf, next) {
	conf.spam = "<div class='pane pane-spam-settings'>" + formField("Block repetitive messages", "toggle", "block-repetitive") + formField("Block nonsense messages", "toggle", "block-nonsense") + formField("Bloack offesnive words", "checks", [ [ "en-moderate", "English moderate" ], [ "en-strict", "English strict" ], [ "zh-strict", "Chinese strict" ] ]) + formField("Custom blocked word", "segmented", "blocked-words" ) + formField("Gaggded users", "segmented", "gagged-users" ) + formField("Banned users", "segmented", "banned-users" ) + "</div>";

	next();
});

// SEO
libsb.on('config-show', function(conf, next) {
	conf.seo = "<div class='pane pane-spam-settings'>" + formField("Allow search engines to index room", "toggle", "allow-index") + "</div>";

	next();
});
