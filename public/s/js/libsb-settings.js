/* jshint browser: true */
/* global $, libsb, lace */

function formField(label, type, id) {
	var input = "";

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
					input += "<input type='checkbox' id='" + id[i][0] + "' name='" + id[i][0] + "'><label for='" + id[i][0] +"'>" + id[i][1] + "</label>";
				}
			} else {
				input = "<input type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'>" + label + "</label>";
			}
			break;
		case 'radio':
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					input += "<input " + id[i][2] + " type='radio' id='" + id[i][0] + "' name='" + id[i][0] + "'/><label for='" + id[i][0] +"'>" + id[i][1] + "</label>";
				}

			} else {
				input = "<input type='radio' id='" + id + "' name='" + id + "'/><label for='" + id +"'>" + label + "</label>";
			}
			break;
		case 'toggle':
			input = "<input class='switch' type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'></label>";
			break;
		case 'multientry':
			input = "<span class='entry multientry' id='" + id + "'><span contenteditable class='item'></span></span>";
			break;
	}

	return "<div class='settings-item'><div class='settings-label'>" + label + "</div><div class='settings-action'>" + input + "</div></div>";
}

// Add event listeners for multientry
$(function() {
	lace.multientry.init();
});

// General
libsb.on('config-show', function(conf, next) {
	conf.general = {
		html: "<div class='list-view list-view-general-settings'>" + formField("Name", "text", "displayname") + formField("Description", "area", "description") + "</div>",
		text: "General settings",
		prio: 900
	}
	next();
});
libsb.on('config-save', function(conf, next){
	var name = $('.list-view-general-settings #displayname').val();

	var desc = $('.list-view-general-settings #description').val();
	conf.name = name;
	conf.description = desc;

	next();
});

// IRC integration
libsb.on('config-show', function(conf, next) {
	conf.irc = {
		html: "<div class='list-view list-view-irc-settings'>" + formField("IRC Server", "text", "ircserver") + formField("IRC Channel", "text", "ircchannel") + "</div>",
		text: "IRC setup",
		prio: 800
	}
	next();
});
libsb.on('config-save', function(conf, next){
	conf.irc = {
		server : $('.list-view-irc-settings #ircserver').val(),
		channel : $('.list-view-irc-settings #ircchannel').val()
	};
	next();
});

// Twitter integration
libsb.on('config-show', function(conf, next) {
	var $twitteruser = "<div class='settings-item'><div class='settings-label'>Signed in as <a href='https://twitter.com/" + "" + "'>" + "user" + "</a></div><div class='settings-action'><a href='https://twitter.com/" + "" + "' class='twitter-account'><img src='" + "" + "' alt=" + "satya164" + "><span class='change'>Change</span></a></div></div>";

	$(".twitter-account").click(function() {
		// do stuff here!
		window.open("r/twitter/login", 'mywin','left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
	});

	conf.twitter = {
		html: "<div class='list-view list-view-twitter-settings'>" + formField("Hashtags", "multientry", "twitterhashtags") + $twitteruser + "</div>",
		text: "Twitter",
		prio: 700
	}

	next();
});
libsb.on('config-save', function(conf, next){

	next();
});

// Threading, is room level threading required for now?
// libsb.on('config-show', function(conf, next) {
// 	conf.thread = "<div class='list-view list-view-thread-settings'>" + formField("Group messages into threads", "toggle", "threading") + "</div>";

// 	next();
// });
// libsb.on('config-save', function(conf, next){

// 	next();
// });

// Permissions
// libsb.on('config-show', function(conf, next) {
// 	conf.permissions = "<div class='list-view list-view-permissions-settings'>" + formField("Who can read messages", "checks", [ [ "read-guests", "Guests" ], [ "read-visitors", "Visitors" ], [ "read-followers", "Followers" ] ]) + formField("Who can post messages", "checks", [ [ "write-guests", "Guests" ], [ "write-visitors", "Visitors" ], [ "write-followers", "Followers" ] ]) + formField("Require approval for following", "toggle", "follow-request") + "</div>";

// 	next();
// });
// libsb.on('config-save', function(conf, next){

// 	next();
// });

// Requests, not needed for the time being
// libsb.on('config-show', function(conf, next) {
// 	var $requests = '<div class="request-msg"><img src="s/img/avatars/Keith.jpg" alt=""><div class="request-details"><div class="username"><a href="">randomdude</a></div><a class="button">Approve</a><a class="button-secondary">Ignore</a></div></div>';

// 	conf.requests = "<div class='list-view list-view-requests-settings'>" + $requests + "</div>";

// 	next();
// });

// Spam control
libsb.on('config-show', function(conf, next) {
	// conf.spam = "<div class='list-view list-view-spam-settings'>" + formField("Block repetitive messages", "toggle", "block-repetitive") + formField("Block nonsense messages", "toggle", "block-nonsense") + formField("Bloack offesnive words", "checks", [ [ "en-moderate", "English moderate" ], [ "en-strict", "English strict" ], [ "zh-strict", "Chinese strict" ] ]) + formField("Custom blocked word", "multientry", "blocked-words" ) + formField("Gaggded users", "multientry", "gagged-users" ) + formField("Banned users", "multientry", "banned-users" ) + "</div>";
	conf.spam = {
		html: "<div class='list-view list-view-spam-settings'>" + formField("Block offensive words", "toggle", 'block-offensive'),
		text: "Spam control",
		prio: 600
	}

	next();
});
libsb.on('config-save', function(conf, next){
	conf.spam = {
		offensive : $('#block-offensive').is(':checked')
	};

	next();
});

// SEO
libsb.on('config-show', function(conf, next) {
	conf.seo = {
		html: "<div class='list-view list-view-seo-settings'>" + formField("Allow search engines to index room", "toggle", "allow-index") + "</div>",
		text: "Search engine indexing",
		prio: 500
	}

	next();
});
libsb.on('config-save', function(conf, next){
	conf.seo = $('.list-view-seo-settings #allow-index').is(':checked');

	next();
});
