/* jshint browser: true */
/* global $, lace */

$(function() {
    // Show and hide search bar
    $(".search-button").on("click", function() {
        $("body").addClass("search-focus");
        // Use a timeout to add focus to avoid double animation in firefox
        setTimeout(function() {
            $(".search-entry").focus();
        }, 500);
    });

    $(document).on("click", function(e) {
        if (e.target !== $(".search-button")[0] && e.target !== $(".search-entry")[0]) {
            lace.animate.transition("fadeout", ".search-entry", function() {
                $("body").removeClass("search-focus");
            });
        }
    });
});
