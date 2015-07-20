"use strict";

/* eslint-env browser */

/*

	Incoming messages

	type              | properties
	------------------+-------------------------------------------
	domain_response   : token (same as challenge)
	signin (obsolete) : auth: { facebook/google : { code/token } }
	auth              : provider, code/token, nick
	follow            : role
	nav               : mode, view, room, thread, dialog, dialogState, textRange, threadRange



	Outgoing messages

	type              | properties
	------------------+-------------------------
	domain_challenge  : token
	minimize          : minimize (boolean)
	ready             :
	auth              : status (guest/restricted/authenticated)
	follow            :
	nav               :


	auth providers are google, facebook, browserid and jws

*/

var core, store,
	enabled = false,
	user = require("../lib/user.js")(),
	generate = require("../lib/generate.js"),
	objUtils = require("../lib/obj-utils.js");

function postMessage(data) {
	var origin = store.get("context", "origin");

	if (window.Android && typeof window.Android.postMessage === "function") {
		window.Android.postMessage(JSON.stringify(data));
	} else if (origin.verified && window.parent !== window) {
		window.parent.postMessage(data, origin.protocol + origin.host);
	}
}

function parseMessage(data) {
	if (typeof data === "string") {
		try {
			data = JSON.parse(data);
		} catch (e) {
			data = {};
		}
	} else if (typeof data !== "object" || data === null) {
		data = {};
	}

	return data;
}

function verifyMessageOrigin(event) {
	var origin = store.get("context", "origin");

	return (
		event.origin === location.origin ||
		origin.verified && event.origin === origin.protocol + "//" + origin.host
	);
}

function sendInit(message) {
	var init = {}, auth;

	if (message.provider) {
		auth = {};

		if (message.token) auth.token = message.token;
		if (message.code) auth.code = message.code;

		init.auth = {};
		init.auth[message.provider] = auth;
	}

	if (message.nick) init.suggestedNick = message.nick;

	core.emit('init-up', init);
}

function verifyParentOrigin(origin, callback) {
	var token = generate.uid();

	window.parent.postMessage({
		type: "domain-challenge",
		token: token
	}, origin.protocol + "//" + origin.host);

	function handleResponse(event) {
		if (parseMessage(event.data).token === token) {
			done(true);
		}
	}

	function done(verified) {
		window.removeEventListener("message", handleResponse);
		if(callback) callback(!!verified);
		callback = null; // prevents callback being invoked a second time.
	}

	window.addEventListener("message", handleResponse);

	setTimeout(done, 500);
}

function onMessage(e) {
	var data;

	if(!verifyMessageOrigin(e)) { return; }
	data = parseMessage(e.data);

	switch (data.type) {
		case "auth":
			sendInit(data);
			break;
		case "follow":
			if(data.role === "none") {
				core.emit("part-up", { to: store.get("nav", "room") });
			} else {
				core.emit("join-up", { to: store.get("nav", "room"), role: data.role });
			}
			break;
		case "nav":
			delete data.type;
			core.emit("setstate", { nav: data });
			break;
	}
}

function onBoot(changes, next) {
	if (changes.context && changes.context.env === "embed" && changes.context.origin) {
		verifyParentOrigin(changes.context.origin, function(verified) {
			changes.context.origin.verified = verified;
			if (verified) enabled = true;
			next();
		});
	} else {
		changes.context = changes.context || {};

		if (window.Android) {
			changes.context.env = "android";
			changes.context.origin = {
				host: typeof window.Android.getPackageName === "function" ? window.Android.getPackageName() : "",
				path: typeof window.Android.getWidgetName === "function" ? window.Android.getWidgetName() : "",
				protocol: "android:",
				verified: true
			};
			enabled = true;
		} else if (window.parent === window) {
			changes.context.origin = {
				host: location.hostname,
				path: location.path,
				protocol: location.protocol,
				verified: true
			};
		} else {
			// Iframe without embed?
			changes.context.env = "embed";
			changes.context.origin = {
				verified: false
			};
		}

		next();
	}
}

function onStateChange(changes) {
	var message, rel;

	if (!enabled) { return; }

	if (changes.app && changes.app.bootComplete) {
		postMessage({ type: "ready" });
	}

	if (changes.context && changes.context.embed && typeof changes.context.embed.minimize === "boolean") {
		postMessage({ type: "minimize", minimize: changes.context.embed.minimize });
	}

	if (changes.user) {
		postMessage({ type: "auth", status: user.isGuest(changes.user) ? "guest" : "registered" });
	}

	if (changes.nav) {
		message = objUtils.clone(store.get("nav"));
		message.type = "nav";

		postMessage(message);
	}
	if ( store.get("nav", "mode") !== "room" && store.get("nav", "mode") !== "chat" && (
		changes.nav && changes.nav.room ||
		changes.user ||
		changes.entities && changes.entities[store.get("nav", "room") + "_" + store.get("user")]
	) ) {
		rel = store.getRelation();

		postMessage({ type: "follow", role: rel && rel.role ? rel.role : "none" });
	}
}

function onInitUp(init) {
	var jws = store.get("context", "init", "jws"),
		origin = store.get("context", "origin"),
		nick = store.get("context", "init", "nick");

	if (!init.origin && origin) { init.origin = origin; }
	if (!init.auth && jws) { init.auth = { jws: jws }; }
	if (!init.suggestedNick && nick) { init.suggestedNick = nick; }
}

module.exports = function(c, conf, s) {
	core = c;
	store = s;

	window.addEventListener("message", onMessage);

	core.on("boot", onBoot, 800);
	core.on("statechange", onStateChange, 500);
	core.on("init-up", onInitUp, 999);
};
