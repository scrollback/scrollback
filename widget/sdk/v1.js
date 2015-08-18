/* eslint-env browser */

"use strict";

var Widget = require("./widget.js"),
	Validator = require("../../lib/validator.js"),
	sb = window.scrollback = window.scrollback || {};

sb.mode = "chat";
sb.room = sb.room || ((sb.streams && sb.streams.length) ? sb.streams[0] : "scrollback");
sb.room = new Validator(sb.room).sanitize({ defaultName: "scrollback" });
sb.nick = sb.nick || sb.suggestedNick;
sb.form = sb.form || "toast";
sb.minimize = (typeof sb.minimize === "boolean") ? sb.minimize : false;

/* eslint-disable no-new */
new Widget(sb);
