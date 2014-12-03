/* jshint browser: true */
/* global $, libsb */
/* exported currentState */

var currentState = window.currentState;

// On navigation, set the body classes.
function updateClass(state, next) {
	var classList;

	if (state.source === "boot") {
		if (state.phonegap) {
			$("body").addClass("media-phonegap");
		} else {
			$("body").addClass("media-normal");
		}
	}

	if (state.old) {
		classList = $("body").attr("class").trim() || "";

		if (state.connectionStatus !== state.old.connectionStatus) {
			classList = classList.replace(/\bstate-\S+/g, "");

			if (state.connectionStatus === "online") {
				classList += " state-online";
			} else {
				classList += " state-offline";
			}
		}

		if (state.mode !== state.old.mode) {
			classList = classList.replace(/\bmode-\S+/g, "");

			if (state.mode) {
				classList += " mode-" + state.mode;
			}
		}

		if (state.view !== state.old.view) {
			classList = classList.replace(/\bview-\S+/g, "");

			if (state.view) {
				classList += " view-" + state.view;
			}
		}

		if (state.tab !== state.old.tab) {
			if (state.tab) {
				if (state.mode === "pref" || state.mode === "conf") {
					$(".list-item.current, .list-view.current").removeClass("current");
					$(".list-item-" + state.tab + "-settings, .list-view-" + state.tab +
					  "-settings").addClass("current");
				} else {
					$(".tab.current").removeClass("current");
					$(".tab-" + state.tab).addClass("current");
				}
			}
		}

		$("body").attr("class", classList);
	}

	next();
}

module.exports = function() {
	libsb.on("navigate", updateClass, 500); // earlier it was 999.
};
