/* jshint browser: true */
/* global libsb, $ */

function formField(label, type, id) {
	var $input;

	switch(type) {
		case 'area':
			$input = $("<textarea>").attr({"id": id, "name": id});
			break;
		case 'text':
			$input = $("<input type='text'>").attr({"id": id, "name": id});
			break;
		case 'checks':
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					$input = $("<input type='checkbox'>").attr({"id": id[i][0], "name": id[i][0]}) + $("<label>" + id[i][1] + "</label>").attr({"for": id[i][0]});
				}
			} else {
				$input = $("<input type='checkbox'>").attr({"id": id, "name": id}) + $("<label>" + label + "</label>").attr({"for": id});
			}
			break;
		case 'toggle':
			$input = $("<input class='switch' type='checkbox'>").attr({"id": id, "name": id}) + $("<label></label>").attr({"for": id});
			break;
		case 'segmented':
			$input = $("<span class='entry segmented'><span contenteditable class='segment'></span></span>").attr({"id": id, "name": id});
			break;
	}

	return $("<div>").addClass("settings-item").append(
			$("<div>").addClass("settings-label").text(label),
			$("<div>").addClass("settings-action").append($input)
	);
}

// General
libsb.on('config-show', function(conf, next) {
	conf.general = $("<div>").append(
		formField("Name", "text", "displayname"),
		formField("Description", "area", "description")
	);
	next();
});

// IRC integration
libsb.on('config-show', function(conf, next) {
	conf.irc = $("<div>").append(
		formField("IRC Server", "text", "ircserver"),
		formField("IRC Channel", "text", "ircchannel")
	);
	next();
});

// Twitter integration
libsb.on('config-show', function(conf, next) {
	var $twitteruser = $("<div class='settings-label'>Signed in as <a href='https://twitter.com/" + "satya164" + ">" + "satya164" + "</a></div><div class='settings-action'><a href='https://twitter.com/" + "satya164" + " class='twitter-account'><img src='" + "" + "' alt=" + "satya164" + "><span class='change'>Change</span></a></div>");

	$(".twitter-account").click(function() {
		// do stuff here!
	});

	conf.twitter = $("<div>").append(
		formField("Hashtags", "segmented", "twitterhashtags"),
		$twitteruser
	);

	next();
});

// Threading
libsb.on('config-show', function(conf, next) {
	conf.thread = $("<div>").append(
		formField("Group messages into threads", "toggle", "threading")
	);

	next();
});

// Permissions
libsb.on('config-show', function(conf, next) {
	conf.permissions = $("<div>").append(
		formField("Who can read messages", "checks", [ [ "read-guests", "Guests" ], [ "read-visitors", "Visitors" ], [ "read-followers", "Followers" ] ]),
		formField("Who can post messages", "checks", [ [ "write-guests", "Guests" ], [ "write-visitors", "Visitors" ], [ "write-followers", "Followers" ] ]),
		formField("Require approval for following", "toggle", "follow-request")
	);

	next();
});

// Requests
libsb.on('config-show', function(conf, next) {
	var $requests = $('<div class="request-msg"><img src="s/img/avatars/Keith.jpg" alt=""><div class="request-details"><div class="username"><a href="">randomdude</a></div><a class="button">Approve</a><a class="button-secondary">Ignore</a></div></div>');

	conf.requests = $("<div>").append(
		$requests
	);

	next();
});

// Spam control
libsb.on('config-show', function(conf, next) {
	conf.spam = $("<div>").append(
		formField("Block repetitive messages", "toggle", "block-repetitive"),
		formField("Block nonsense messages", "toggle", "block-nonsense"),
		formField("Bloack offesnive words", "checks", [ [ "en-moderate", "English moderate" ], [ "en-strict", "English strict" ], [ "zh-strict", "Chinese strict" ] ]),
		formField("Custom blocked word", "segmented", "blocked-words" ),
		formField("Gaggded users", "segmented", "gagged-users" ),
		formField("Banned users", "segmented", "banned-users" )
	);

	next();
});

// SEO
libsb.on('config-show', function(conf, next) {
	conf.seo = $("<div>").append(
		formField("Allow search engines to index room", "toggle", "allow-index")
	);

	next();
});
