/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function () {
    'use strict';

    // Show popover
    $(".has-popover").on("click mouseover", function () {
        $(this).addClass("popover-active");
    });

    // Hide popover
    function hidePopOver() {
        $('.popover').on("click mouseover", function (e) {
            e.stopPropagation();
        });

        $(".has-popover").removeClass("popover-active");
    }

    $("body").on("click", function () {
        hidePopOver();
    });

    $("body").on("mouseover", setTimeout(function () {
        hidePopOver();
    }, 1000));

    // Style active states in mobile
    document.addEventListener("touchstart", function () {}, true);

}());