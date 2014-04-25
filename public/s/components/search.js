/* jshint browser: true */
/* global $ */

$(function() {
    // Show and hide search bar
    $(".search-button").on("click", function() {
        $("body").addClass("search-focus");
        // Use a timeout to add focus to avoid double animation in firefox
        setTimeout(function() {
            $(".search-entry").focus();
        }, 500);
    });

    $(".search-entry").focusout(function() {
        $("body").removeClass("search-focus");
    });
});
