/* eslint-env browser */
/* global $ */

"use strict";

var formField = require("../ui/utils/form-field.js"),
	twitterUsername;

module.exports = function(core) {
	// Twitter integration
	core.on("conf-show", function(tabs, next) {
		var $div = $("<div>"),
	        results = tabs.room,
	        twitter = results.params.twitter;

		if (!twitter) {
	        twitter = {};
	    }

		twitterUsername = twitter.username;

	    var $twitterTags = formField("Hashtags", "multientry", "twitter-hashtags", twitter.tags),
	        $twitterButton = $("<a>").addClass("button twitter").attr("id", "twitter-account"),
	        $twitterAccount = formField("", "", "twitter-text", $twitterButton),
	        $twitterMsg = formField("", "info", "twitter-message-text", ""),
	        $twitterString = $twitterMsg.find("#twitter-message-text"),
	        updateFields = function() {
	            if (twitterUsername) {
	                $twitterButton.removeClass("twitter-signed-out");
	                $twitterButton.addClass("twitter-signed-in");
	                $twitterButton.text("Remove account");
	                $twitterAccount.find(".settings-label").text("Signed in as " + twitterUsername);
	                $twitterString.empty();
	            } else {
	                $twitterButton.removeClass("twitter-signed-in");
	                $twitterButton.addClass("twitter-signed-out");
	                $twitterButton.text("Sign in to Twitter");
	                $twitterAccount.find(".settings-label").text("Not signed in");
	                $twitterString.text("Please sign in to Twitter to watch hashtags");
	            }
	        };

	    $twitterButton.on("click", function() {
			// do stuff here!
	        if ($twitterButton.hasClass("twitter-signed-out")) {
			  window.open("../r/twitter/login", "mywin", "left=20,top=20,width=500,height=500,toolbar=1,resizable=0");
	        } else if ($twitterButton.hasClass("twitter-signed-in")) {
	            twitterUsername = null;
	            updateFields();
	        }
		});

		$(window).on("message", function(e) {
			var suffix = "scrollback.io", data,
				isOrigin = e.originalEvent.origin.indexOf(suffix, e.originalEvent.origin.length - suffix.length) !== -1;
				data = e.originalEvent.data;

			try {
	            data = JSON.parse(e.originalEvent.data);
	        } catch (err) {
	            return;
	        }

	        if (!isOrigin || !data.twitter ) { return; }

	        twitterUsername = data.twitter.username;
	        updateFields();
	    });

	    updateFields();

		$div.append(
	        $twitterTags,
	        $twitterAccount,
	        $twitterMsg
		);

		tabs.twitter = {
			text: "Twitter integration",
			html: $div
		};

		next();
	}, 600);

	core.on("conf-save", function(room, next) {
	    var tags = $("#twitter-hashtags").multientry("items", true).join(" ");

	    room.params.twitter = {};

	    if (tags || twitterUsername) {
	        room.params.twitter = {
	            tags: tags,
	            username: twitterUsername
	        };
	    }

		next();
	}, 500);
};
