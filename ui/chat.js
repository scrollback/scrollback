/* jshint browser: true */
/* global $, format */

var chatEl = {},
	timeBefore;

$(function() {
	var $template = $(".chat-item").eq(0);

	chatEl.render = function($el, text) {
		$el = $el || $template.clone(false);

		if (text.type === "missing") {
			$el = $("<div>").addClass("chat-item-missing");
			$el.attr("data-index", (text.endTime || text.startTime || 0) + "-missing");
		} else {
			$el.find(".chat-nick").text(text.from.replace(/^guest-/, ""));
			$el.find(".chat-message").html(format.linkify(format.textToHtml(	text.text || "")));
			$el.find(".chat-timestamp").text(format.friendlyTime(text.time, new Date().getTime()));
			$el.attr("data-index", text.time+"-"+text.id);
			$el.attr("id", "chat-" + text.id);

			if (text.threads && text.threads.length) {
				for (var i in text.threads) {
					if (window.currentState.thread && window.currentState.thread === text.threads[i].id) {
						$el.attr("data-thread", text.threads[i].id);
						break;
					}
				}

				if (!$el.attr("data-thread") && text.threads[0].id) {
					$el.attr("data-thread", text.threads[0].id);
				}

				if ($el.attr("data-thread")) {
					$el.addClass("conv-" + $el.attr("data-thread").substr(-1));
				}
			}

			if (text.labels) {
				for (var label in text.labels) {
					if (text.labels[label] === 1) {
						$el.addClass("chat-label-" + label);
					}
				}
			}

			if (text.text) {
				var $container = $(".chat-area"),
					width = $container.width(),
					lines = text.text.split("\n"),
					lineCount = 0,
					charsPerLine;

				width = (width > 360) ? width : 360;
				charsPerLine = width / (parseInt($container.css("font-size"), 10) * 0.6);

				lines.forEach(function(line) {
					lineCount += Math.ceil(line.length / charsPerLine);
				});

				if (lineCount > 4) {
					$el.addClass("chat-item-long");
				}
			}

			if (timeBefore) {
				if ((text.time - timeBefore) > 180000) {
					$el.addClass("chat-item-timestamp-shown");
				}
			}

			timeBefore = text.time;
		}

		return $el;
	};
});

module.exports = chatEl;