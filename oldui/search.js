/* jshint browser: true */
/* global $, libsb */

$(function() {
	var $entry = $(".search-entry"),
		$bar = $(".search-bar"),
		showSearchBar = function() {
			$("body").addClass("search-focus");

			$bar.velocity({
				opacity: [1, 0],
				translateY: [0, "-100%"]
			}, 300, function() {
				$entry.focus().data("search-ready", true);
			});
		},
		hideSearchBar = function() {
			$bar.velocity({
				opacity: [0, 1],
				translateY: ["-100%", 0]
			}, 300, function() {
				$("body").removeClass("search-focus");
				$entry.data("search-ready", false);
			});
		};

	// Show and hide search bar
	$(".search-button").on("click", showSearchBar);

	$(document).on("click", function(e) {
		if (e.target !== $(".search-button")[0] && e.target !== $entry[0] && $entry.data("search-ready")) {
			hideSearchBar();
		}
	});

	$(".search-entry").keypress(function(e) {
		if (e.which == 13) {
			hideSearchBar();

			e.preventDefault();

			libsb.emit('navigate', {
				view: "meta",
				mode: "search",
				tab: "search-local",
				query: $entry.val()
			});
		}
	});
});
