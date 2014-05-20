/* jshint browser: true */
/* global $, lace */

$(function() {
    // Show and hide search bar
    $(".search-button").on("click", function() {
        $("body").addClass("search-focus");
        // Use a timeout to add focus to avoid double animation in firefox
        setTimeout(function() {
            $(".search-entry").focus().data("search-ready", true);
        }, 300);
    });

    $(document).on("click", function(e) {
        if (e.target !== $(".search-button")[0] && e.target !== $(".search-entry")[0] && $(".search-entry").data("search-ready")) {
            $("body").removeClass("search-focus");
            $(".search-entry").data("search-ready", false);
        }
    });


    $(".search-entry").keypress(function(e) {
        if(e.which == 13){
            e.preventDefault();
            libsb.emit('navigate', {view: "meta", mode: "search", tab: "search-local", query: $(".search-entry").val()});
        }
    });;
});
