/* jshint browser: true */
/* global $, libsb, lace */

var formField = require('../lib/formField.js');
var twitterUsername;
// Twitter integration
libsb.on('config-show', function(tabs, next) {
	var div = $('<div>').addClass('list-view list-view-twitter-settings');

//	var p = $('<div class="settings-item"><div class="settings-label" id="twitter-text"></div><div class="settings-action"><a id="twitter-account" class="button"></a></div></div><div class="settings-item"><div class="settings-label"></div><div class="settings-action" id="twitter-message"></div></div>');
         
        var settingsItem = $('<div>').addClass('settings-item');
        var twitterText = $('<div>').addClass('settings-label').attr('id', 'twitter-text');
        var twitterMessage = $('<div>').addClass('settings-action').attr('id', 'twitter-message');
        var settingsAction = $('<div>').addClass('settings-action');
        var button = $('<a>').addClass('button').attr('id', 'twitter-account');
        var settingsLabel = $('<div>').addClass('settings-label');

	var textField = formField("Hashtags", "multientry", "twitter-hashtags");

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
        

        //twitter setting
        results = tabs.room; 
        if (!results.params.twitter) results.params.twitter = {};
        var twitter = results.params.twitter;

        if (twitter.username) {
                twitterText.text("Twitter Account: " + twitter.username); 
                // $('#twitter-text').text("Twitter Account: " + twitter.username);
                // $("#twitter-account").text("Change");
                button.text("Change");
        } else {
                // $('#twitter-text').text("Not signed in");
                twitterText.text("Not signed in");
                button.text("Sign in");
                twitterMessage.text("Please sign in to Twitter to watch hashtags");
                // $("#twitter-account").text("Sign in");
                // $("#twitter-message").text("Please sign in to twitter to watch hashtags.");
        }

        if (twitter.tags) {
                lace.multientry.add($("#twitter-hashtags"), twitter.tags);
        }

//var p = $('<div class="settings-item"><div class="settings-label" id="twitter-text"></div><div class="settings-action"><a id="twitter-account" class="button"></a></div></div><div class="settings-item"><div class="settings-label"></div><div class="settings-action" id="twitter-message"></div></div>');
        var innerDiv1 = settingsItem;
        innerDiv1.append(twitterText);
        settingsAction.append(button);
        innerDiv1.append(settingsAction);

        var innerDiv2 = settingsItem;
        innerDiv2.append($('<div>').addClass('settingsLabel'));
        innerDiv2.append(twitterMessage);
        
        div.append(innerDiv1, innerDiv2);
	tabs.twitter = {
		html: div,
		text: "Twitter",
		prio: 700
	};

	next();
});

libsb.on('config-save', function(room, next){
	room.params.twitter = {
		tags: lace.multientry.items($('#twitter-hashtags')).join(" "),
		username: twitterUsername
	};
	next();
});
