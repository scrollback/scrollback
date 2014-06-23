/* jshint browser: true */
/* global $, libsb */

var lace = require("../lib/lace.js"),
	formField = require("../lib/formField.js"),
	twitterUsername;

// Twitter integration
libsb.on("config-show", function(tabs, next) {
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
        $twitterMessage = formField("", "", "twitter-message", $("<div>").attr("id", "twitter-message")),
        updateFields = function() {
            if (twitterUsername) {
                $twitterButton.text("Change account");
                $twitterAccount.find(".settings-label").text("Signed in as " + twitterUsername);
                $twitterMessage.find(".settings-action").empty();
            } else {
                $twitterButton.text("Sign in to Twitter");
                $twitterAccount.find(".settings-label").text("Not signed in");
                $twitterMessage.find(".settings-action").text("Please sign in to Twitter to watch hashtags");
            }
        };

    $twitterButton.on("click", function(){
		// do stuff here!
		window.open("../r/twitter/login", "mywin","left=20,top=20,width=500,height=500,toolbar=1,resizable=0");
	});

	$(window).on("message", function(e) {
		var suffix = "scrollback.io", data,
			isOrigin = e.originalEvent.origin.indexOf(suffix, e.originalEvent.origin.length - suffix.length) !== -1;

        try {
            data = JSON.parse(e.originalEvent.data);
        } catch(e) {
            return;
        }

        if (!isOrigin || !data.twitter ) return;

        twitterUsername = data.twitter.username;

        updateFields();
	});

    updateFields();

	$div.append(
        $twitterTags,
        $twitterAccount,
        $twitterMessage
	);

	tabs.twitter = {
		text: "Twitter integration",
		html: $div,
		prio: 700
	};

	next();
});

libsb.on("config-save", function(room, next){
    var tags = lace.multientry.items($("#twitter-hashtags")).join(" ");

    room.params.twitter = {};

    if (tags || twitterUsername) {
        room.params.twitter = {
            tags: tags,
            username: twitterUsername
        };
    }

	next();
});
