/* jshint browser: true */
/* global $ */

$(function() {
    // Show and hide search bar
    $(".search-button").on("click", function() {
        $(document.body).toggleClass("search-focus");
        // Use a timeout to add focus to avoid double animation in firefox
        setTimeout(function() {
            $(".search-entry").focus();
        }, 500);
    });

    $('.search-entry').focusout(function() {
        $(document.body).removeClass("search-focus");
    });
});
