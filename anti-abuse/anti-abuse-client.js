/* jshint browser: true */
/* global $ */

var formField = require("../ui/helpers/form-field.js");

module.exports = function(core, config, store) {
	core.on("conf-show", function(tabs, next) {
		var room = tabs.room,
			antiAbuse,
			$div;

		room.params = room.params || {};

		antiAbuse = room.params.antiAbuse = room.params.antiAbuse || {};

		antiAbuse.block = antiAbuse.block || { english: false };
		antiAbuse.customPhrases = antiAbuse.customPhrases || [];

		if (typeof antiAbuse.spam !== 'boolean') {
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
			html: $div,
			prio: 600
		};

		next();
	}, 500);

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

	function hasLabel(label, text) {
		var labels = text.labels;

		for (var i in labels) {
			if (i === label && labels[i] === 1) {
				return true;
			}
		}

		return false;
	}

	core.on('text-menu', function(menu, next) {
		var textObj;

		if (menu.role !== "owner") {
			return next();
		}

		core.emit('getTexts', { ref: menu.target.id.substring(5), to: store.getNav().room}, function(err, data) {
			var target = menu.target;

			textObj = data.results[0];

			if (hasLabel('hidden', textObj)) {
				menu.items.unhidemessage = {
					prio: 500,
					text: 'Unhide Message',
					action: function() {
						core.emit('edit-up', {to: store.getNav().room, labels: {'hidden': 0}, ref: target.id.substring(5), cookie: false});

						$(target).removeClass('chat-label-hidden');
					}
				};
			} else {
				menu.items.hidemessage = {
					prio: 500,
					text: 'Hide Message',
					action: function() {
						core.emit('edit-up', {to: store.getNav().room, labels: {'hidden': 1}, ref: target.id.substring(5), cookie: false});

						$(target).addClass('chat-label-hidden');
					}
				};
			}

			if (hasLabel('abusive', textObj)) {
				menu.items.markasnotabusive = {
					prio: 500,
					text: 'Mark as not abusive',
					action: function() {
						core.emit('edit-up', {to: store.getNav().room, labels: {'abusive': 0}, ref: target.id.substring(5), cookie: false});

						$(target).removeClass('chat-label-abusive');
					}
				};
			}

			next();
		});
	}, 500);
};
