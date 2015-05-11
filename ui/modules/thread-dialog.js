/* eslint-env browser */
/* global $ */

"use strict";

module.exports = function(core, config, store) {
	var generate = require("../../lib/generate.js"),
		threadError = "We could not create the thread. Please refresh the page and try again.";

	function createThread(title, text, callback) {
		var id = generate.uid(32);

		if (typeof callback !== "function") {
			callback = function() {};
		}

		core.emit("text-up", {
			id: id,
			to: store.get("nav", "room"),
			from: store.get("user"),
			text: text,
			thread: id, // this is how you create a new thread.
			title: title
		}, function(err) {
			if (err) {
				return callback("error", threadError);
			}

			core.emit("setstate", {
				nav: { dialog: null }
			});
		});
	}

	core.on("createthread-dialog", function(dialog) {
		dialog.title = "Start a new discussion";
		dialog.content = [
			"<input type='text' id='createthread-dialog-thread' placeholder='Enter discussion title' autofocus>",
			"<textarea id='createthread-dialog-text' placeholder='Enter your message' style='resize:none'></textarea>"
		];
		dialog.action = {
			text: "Start discussion",
			action: function() {
				var $threadEntry = $("#createthread-dialog-thread"),
					$textEntry = $("#createthread-dialog-text");

				$threadEntry.validInput(function(threadTitle, callback) {
					threadTitle = (threadTitle || "").trim();

					if (!threadTitle) {
						callback("Thread title cannot be empty");
					} else {
						$textEntry.validInput(function(text, cb) {
							text = (text || "").trim();

							if (!text) {
								cb("Message cannot be empty");
							} else {
								createThread(threadTitle, text, function(res, message) {
									if (res === "error") {
										cb(message);
									}
								});
							}
						});
					}
				});
			}
		};
	}, 100);
};
