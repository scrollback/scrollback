var config = require("../client-config.js");
var widget = require("widget.js");
var host = config.server.host;
var validate = require("../lib/validate.js");
var domReady = document.readyState === "complete";

document.addEventListener("readystatechange", function(){
	if (document.readyState === "complete") {
		domReady = true;
	}
});

function constructEmbed(options) {
	var embed = {},
		host = config.server.protocol + config.server.host;

	if (validate(options.room)) {
		console.log("Invalid room");
		return;
	}
	embed.room = options.room;
	embed.form = options.form || "toast";
	if (options.nick) embed.nick = options.nick;
	embed.minimize = (typeof options.minimize === "boolean") ? options.minimize : false;

	embed.origin = {
		protocol: location.protocol,
		host: location.host,
		path: location.pathname + location.search + location.hash
	};

	return embed;
}

function buildIframe(embed){
	var iframe = document.createElement("iframe");

	return iframe;
}

function scrollback(opts) {
	var style, embed, self = {
		pendingCallbacks: {},
		options: opts,
		state: {},
		iframe: null,
		config: config
	};

	embed = constructEmbed(opts);
	if (!embed) return;


	// Insert required styles
	style = document.createElement("link");
	style.rel = "stylesheet";
	style.type = "text/css";
	style.href = host + "/s/styles/dist/embed.css";


	self.emit = function () {

	};

	widget.navigation = require("./navigation.js")(self);
	widget.following = require("./following.js")(self);
	widget.options = require("./options.js")(self);
	widget.signin = require("./signin.js")(self);
	return widget;
}


window.scrollback = scrollback;