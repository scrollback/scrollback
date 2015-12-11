/* eslint-env browser */
/* global $ */


"use strict";
var formField = require("../ui/utils/form-field.js");

module.exports = function(core, config, store) {


	function addBanMenu(from, menu, next) {
		var room = store.get("nav", "room"),
			rel = store.getRelation(),
			senderRelation = store.getRelation(room, from),
			senderRole, senderTransitionRole;

		senderRelation = senderRelation ? senderRelation : {};
		senderRole = senderRelation.role ? senderRelation.role : "none";
		senderTransitionRole = senderRelation.transitionRole ? senderRelation.transitionRole : "none";

		if (/^guest-/.test(from)) senderRole = "guest";

		switch (senderRole) {
			case "follower":
			case "none":
			case "moderator":
			case "registered":
				if (senderRole === "moderator" && rel.role !== "owner") break;
				menu.items.banuser = {
					prio: 550,
					text: "Ban user",
					action: function() {
						core.emit("expel-up", {
							to: room,
							ref: from,
							role: "banned",
							transitionRole: senderRole,
							transitionType: null
						});
					}
				};
				break;
			case "banned":
				menu.items.unbanuser = {
					prio: 550,
					text: "unban user",
					action: function() {
						core.emit("admit-up", {
							to: room,
							ref: from,
							role: senderTransitionRole || "follower"
						});
					}
				};
				break;
			case "owner":
			case "guest":
				break;
		}

		next();
	}

	core.on("conf-show", function(tabs, next) {
		var room = tabs.room,
			antiAbuse,
			$div;

		room.params = room.params || {};

		antiAbuse = room.params.antiAbuse = room.params.antiAbuse || {};

		antiAbuse.block = antiAbuse.block || {
			english: false
		};
		antiAbuse.customPhrases = antiAbuse.customPhrases || [];

		if (typeof antiAbuse.spam !== "boolean") {
			antiAbuse.spam = true;
		}

		$div = $("<div>").append(
			formField("Spam control", "toggle", "spam-control", antiAbuse.spam),
			formField("Blocked words list", "check", "blocklists", [
				["list-en-strict", "English abusive words", antiAbuse.block.english]
			]),
			formField("Custom blocked phrases/word", "area", "block-custom", antiAbuse.customPhrases.join("\n")),
			formField("", "info", "spam-control-helper-text", "One phrase/word each line")
		);

		tabs.spam = {
			text: "Spam control",
			html: $div
		};

		next();
	}, 600);

	core.on("conf-save", function(room, next) {
		room.params = room.params || {};
		room.params.antiAbuse = {
			spam: $("#spam-control").is(":checked"),
			block: {
				english: $("#list-en-strict").is(":checked")
			},
			customPhrases: $("#block-custom").val().split("\n").map(function(item) {
				return (item.trim()).toLowerCase();
			})
		};
		next();
	}, 500);

	core.on("text-menu", function(menu, next) {
		var textObj = menu.textObj,
			room = store.get("nav", "room"),
			rel = store.getRelation();

		if (!(rel && (/(owner|moderator|su)/).test(rel.role) && textObj)) {
			return next();
		}

		if (textObj.tags && textObj.tags.indexOf("hidden") > -1) {
			menu.items.unhidemessage = {
				prio: 500,
				text: "Unhide message",
				action: function() {
					var tags = Array.isArray(textObj.tags) ? textObj.tags.slice(0) : [];

					core.emit("edit-up", {
						to: room,
						ref: textObj.id,
						tags: tags.filter(function(t) {
							return t !== "hidden";
						})
					});
				}
			};
		} else {
			menu.items.hidemessage = {
				prio: 500,
				text: "Hide message",
				action: function() {
					var tags = Array.isArray(textObj.tags) ? textObj.tags.slice(0) : [];

					tags.push("hidden");

					core.emit("edit-up", {
						to: room,
						ref: textObj.id,
						tags: tags
					});
				}
			};
		}
		addBanMenu(textObj.from, menu, next);
	}, 500);



	core.on("people-menu", function(menu, next) {
		var rel = store.getRelation();

		if (!(rel && (/(owner|moderator|su)/).test(rel.role))) {
			return next();
		}
		addBanMenu(menu.user.id, menu, next);
	}, 500);

	core.on("thread-menu", function(menu, next) {
		var threadObj = menu.threadObj,
			room = store.get("nav", "room"),
			rel = store.getRelation();

		if (!(rel && (/(owner|moderator)/).test(rel.role) && threadObj)) {
			return next();
		}

		if (threadObj.tags && threadObj.tags.indexOf("thread-hidden") > -1) {
			menu.items.unhidethread = {
				prio: 500,
				text: "Unhide discussion",
				action: function() {
					var tags = Array.isArray(threadObj.tags) ? threadObj.tags.slice(0) : [];

					core.emit("edit-up", {
						to: room,
						ref: threadObj.id,
						tags: tags.filter(function(t) {
							return t !== "thread-hidden";
						}),
						color: threadObj.color // Ugly hack around lack of color info on a discussion
					});
				}
			};
		} else {
			menu.items.hidethread = {
				prio: 500,
				text: "Hide discussion",
				action: function() {
					var tags = Array.isArray(threadObj.tags) ? threadObj.tags.slice(0) : [];

					tags.push("thread-hidden");

					core.emit("edit-up", {
						to: room,
						ref: threadObj.id,
						tags: tags,
						color: threadObj.color
					});
				}
			};
		}

		next();
	}, 500);
};
