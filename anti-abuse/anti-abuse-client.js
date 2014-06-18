/* jshint browser: true */
/* global $, libsb */

var formField = require("../lib/formField.js");

libsb.on("config-show", function(tabs, next) {
	var room = tabs.room,
		lists = room.params["anti-abuse"]["block-lists"];

	if (!room.params["anti-abuse"] || typeof room.params["anti-abuse"].wordblock !== "boolean") {
		room.params["anti-abuse"].wordblock = true;
	}

	if (!room.params["anti-abuse"] || !(lists instanceof Array)) {
		lists = [];
	}

	var $div = $("<div>").append(
		formField("Block offensive words", "toggle", "block-offensive", room.params["anti-abuse"].wordblock),
		formField("Blocked words list", "check", "blocklists-list", [
			["list-en-strict", "English strict", (lists.indexOf("list-en-strict") > -1)],
			["list-en-moderate", "English moderate", (lists.indexOf("list-en-moderate") > -1)],
			["list-zh-strict", "Chinese strict", (lists.indexOf("list-zh-strict") > -1)],
		]),
		formField("Custom blocked words", "area", "block-custom", room.params["anti-abuse"].customWords)
	);

	tabs.spam = {
		text: "Spam control",
		html: $div,
		prio: 600
	};

	next();
});

libsb.on("config-save", function(room, next){
	room.params["anti-abuse"] = {
		wordblock: $("#block-offensive").is(":checked"),
		"block-lists": $("input[name='blocklists-list']:checked").map(function(i, el) {
			return $(el).attr("value");
		}).get(),
		customWords: $("#block-custom").val().split(",").map(function(item) {
			return (item.trim()).toLowerCase();
		})
	};

	next();
});
