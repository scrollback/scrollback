/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb */

$(function() {
	var msgarr = [],
		loopMsg,
		checkMsg = function() {
			var $bar = $(".title-bar"),
				$ticker = $(".minimize-ticker"),
				classes = $bar.attr("class").replace(/(has-messages)+(-\d+)?/g, "").trim();

			$bar.attr("class", classes);

			clearInterval(loopMsg);

			if (msgarr.length) {
				if (window.currentState.minimize) {
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
					msgarr = [];
				}
			}
		};

	libsb.on("text-dn", function(text, next) {
		if (window.currentState.minimize && text.from && text.text && text.to === window.currentState.roomName) {
			msgarr.push(text.from.replace(/^guest-/, "") + ": " + text.text);

			if (msgarr.length > 3) {
				msgarr = msgarr.splice(Math.max(msgarr.length - 3, 1));
			}

			checkMsg();
		}

		next();
	}, 100);

	libsb.on("navigate", function(state, next) {
		if (state.old && state.minimize !== state.old.minimize) {
			checkMsg();
		}

		next();
	}, 100);
});
