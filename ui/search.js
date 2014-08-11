/* jshint browser: true */
/* global $, libsb */

var lace = require("../lib/lace.js");

$(function() {
    var $entry = $(".search-entry"),
        $bar = $(".search-bar"),
        showSearchBar = function() {
            $("body").addClass("search-focus");

            lace.animate("slideDownIn", $bar, function() {
                $entry.focus().data("search-ready", true);
            }, 300);
        },
        hideSearchBar = function() {
            lace.animate("slideUpOut", $bar, function() {
                $("body").removeClass("search-focus");
                $entry.data("search-ready", false);
            }, 300);
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
