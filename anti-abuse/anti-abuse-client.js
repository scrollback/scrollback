/* jshint browser: true */
/* global $ */

var formField = require("../ui/utils/form-field.js");

module.exports = function(core, config, store) {
	core.on("conf-show", function(tabs, next) {
		var room = tabs.room,
			antiAbuse,
			$div;

		room.params = room.params || {};

		antiAbuse = room.params.antiAbuse = room.params.antiAbuse || {};

		antiAbuse.block = antiAbuse.block || { english: false };
		antiAbuse.customPhrases = antiAbuse.customPhrases || [];

		if (typeof antiAbuse.spam !== "boolean") {
			antiAbuse.spam = true;
		}

		$div = $("<div>").append(
			formField("Spam control", "toggle", "spam-control", antiAbuse.spam),
			formField("Blocked words list", "check", "blocklists", [
				["list-en-strict", "English abusive words", antiAbuse.block.english ]
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
		room.params.antiAbuse = {
			spam: $("#spam-control").is(":checked"),
			block:{
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
					var tags = (textObj.tags || []).slice(0);

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
					textObj.tags = (textObj.tags || []).slice(0);
					textObj.tags.push("hidden");

					core.emit("edit-up", {
						to: room,
						ref: textObj.id,
						tags: textObj.tags
					});
				}
			};
		}

		next();
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
					var tags = (threadObj.tags || []).slice(0);

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
					threadObj.tags = (threadObj.tags || []).slice(0);
					threadObj.tags.push("thread-hidden");

					core.emit("edit-up", {
						to: room,
						ref: threadObj.id,
						tags: threadObj.tags,
						color: threadObj.color
					});
				}
			};
		}

		next();
	}, 500);
};
