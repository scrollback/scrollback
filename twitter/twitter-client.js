var formField = require('../lib/formField.js');
var twitterUsername;
// Twitter integration
libsb.on('config-show', function(conf, next) {
	var div = $('<div>');
	var p = $('<p id="twitter-text">');
	var twitterBtn = $('<a id="twitter-account">').addClass('button');
	var textField = formField("Hashtags", "multientry", "twitter-hashtags");//formField("Twitter #tags", "text", "twitter-hashtags");
	twitterBtn.click(function(){
		console.log("twitter sign in button clicked");
		// do stuff here!
		window.open("../r/twitter/login", 'mywin','left=20,top=20,width=500,height=500,toolbar=1,resizable=0');
	});
	
	div.append(p);
	div.append(twitterBtn);
	div.append(textField);
	window.addEventListener("message", function(event) {
		console.log("event", event);
		var suffix = "scrollback.io";
		var isOrigin = event.origin.indexOf(suffix, event.origin.length - suffix.length) !== -1;
		if (isOrigin) {
			twitterUsername = event.data;
			$("#twitter-account").html("CHANGE");
			$('#twitter-text').html("Admin Twitter Account: " + twitterUsername);
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
		tags: $('#twitter-hashtags').lace().join(" "),
		username: twitterUsername
	};
	next();
});
