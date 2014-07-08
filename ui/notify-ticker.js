/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb */

$(function() {
	var msgarr = [],
		loopMsg,
		checkMsg = function() {
			clearInterval(loopMsg);

			if (window.currentState.minimize) {
				var $bar = $(".minimize-bar"),
					$ticker = $(".minimize-ticker"),
					classes = $bar.attr("class").replace(/has-messages-\d+/g, "").trim();

				$bar.attr("class", classes);

				if (msgarr.length) {
					var i = 0,
						setMsg = function() {
							$ticker.text(msgarr[i]);

							i++;

							if (i >= msgarr.length) {
								i = 0;
							}
						};

					setMsg();
					loopMsg = setInterval(setMsg, 1500);

					$bar.addClass("has-messages has-messages-" + msgarr.length);
				} else {
					$bar.removeClass("has-messages");
				}
			} else if (msgarr.length) {
				msgarr = [];
			}
		};

	libsb.on("text-dn", function(text, next) {
		if (window.currentState.minimize && text.from && text.text) {
			msgarr.push(text.from.replace(/^guest-/, "") + ": " + text.text);

			if (msgarr.length > 3) {
				msgarr = msgarr.splice(Math.max(msgarr.length - 3, 1));
			}

			checkMsg();
		}

		next();
	}, 100);

	libsb.on("navigate", function(state, next) {
		var $title = $(".minimize-room-title");

		if (state && (!state.old || state.roomName != state.old.roomName)) {
			$title.text(state.roomName);
		}

		if (state.old && state.minimize !== state.old.minimize) {
			checkMsg();
		}

		next();
	}, 100);
});
