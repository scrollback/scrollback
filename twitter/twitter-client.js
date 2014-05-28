/* jshint browser: true */
/* global $, libsb, lace */

var formField = require('../lib/formField.js');
var twitterUsername;
// Twitter integration
libsb.on('config-show', function(conf, next) {
	var div = $('<div>').addClass('list-view list-view-twitter-settings');

	var p = $('<div class="settings-item"><div class="settings-label" id="twitter-text"></div><div class="settings-action"><a id="twitter-account" class="button"></a></div></div><div class="settings-item"><div class="settings-label"></div><div class="settings-action" id="twitter-message"></div></div>');

	var textField = formField("Hashtags", "multientry", "twitter-hashtags");


	div.append(p);
	div.append(textField);
	$(document).on("click", "#twitter-account" ,function(){
		console.log("twitter sign in button clicked");
		// do stuff here!
		window.open("../r/twitter/login", 'mywin','left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
	});

	window.addEventListener("message", function(event) {
		console.log("event", event);
		var suffix = "scrollback.io";
		var isOrigin = event.origin.indexOf(suffix, event.origin.length - suffix.length) !== -1;
		if (isOrigin) {
			twitterUsername = event.data;
			$("#twitter-account").text("Change");
			$('#twitter-text').text("Admin Twitter Account: " + twitterUsername);
			$("#twitter-message").empty();
		}
	}, false);

	conf.twitter = {
		html: div,
		text: "Twitter",
		prio: 700
	};

	next();
});

libsb.on('config-save', function(conf, next){
	console.log("config save called for twitter");
	conf.twitter = {
		tags: lace.multientry.items($('#twitter-hashtags')).join(" "),
		username: twitterUsername
	};
	next();
});
