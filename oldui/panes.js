/* jshint browser: true */
/* global $, libsb */

$(function() {
	$(document).on("click", ".tab", function() {

		var tab = $(this).attr("class").match(/\btab-([a-z\-]+)\b/);
		if (!tab) return;
		tab = tab[1]; // match returns an array with the capture groups starting at index 1.
		libsb.emit("navigate", {
			tab: tab,
			source: "tabs"
		});
	});

	$(document).on("click", ".list-item", function() {

		var item = $(this).attr("class").match(/\blist-item-([a-z\-]+)-settings\b/);

		if (!item) return;

		item = item[1]; // match returns an array with the capture groups starting at index 1.

		libsb.emit("navigate", {
			tab: item
		});

	});
	
	libsb.on("navigate", function(state, next) {
		if (state.tab !== state.old.tab) {
			if (state.tab && state.mode == "normal"){
				$(".tab.current").removeClass("current");
				$(".tab-" + state.tab).addClass("current");
			}
		}
		next();
	}, 100);
});