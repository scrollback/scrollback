/* jshint browser: true */
/* global $, libsb */

$(function() {
	$(document).on("click", ".tab",function() {

		var tab = $(this).attr("class").match(/\btab-([a-z\-]+)\b/);
		if(!tab) return;
		tab = tab[1]; // match returns an array with the capture groups starting at index 1.

		libsb.emit("navigate", { tab: tab, source: "tabs"});
	});

	$(document).on("click", ".list-item",function() {

		var item = $(this).attr("class").match(/\blist-item-([a-z\-]+)\b/);

		if(!item) return;

		item = item[1]; // match returns an array with the capture groups starting at index 1.

			$(".list-view, .list-item").removeClass("current");
			$(".list-view-" + item + ", .list-item-" + item).addClass("current");
	});
});
