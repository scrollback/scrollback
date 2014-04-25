/* jshint browser: true */
/* global $, libsb */

$(function() {
	$(".tab").on("click", function() {
		var tab = $(this).attr("class").match(/\btab-([a-z\-]+)\b/);
		if(!tab) return;
		tab = tab[1]; // match returns an array with the capture groups starting at index 1.

		libsb.emit('navigate', { tab: tab, source: "tabs" });
	});
});
