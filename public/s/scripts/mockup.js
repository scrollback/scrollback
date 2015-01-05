/* jshint browser: true */
/* global $ */

$(function() {
    $(".action-sidebar-open").on("click", function() {
        $("body").addClass("sidebar-open");
    });

    $(".action-sidebar-close").on("click", function() {
        $("body").removeClass("sidebar-open");
    });
});
