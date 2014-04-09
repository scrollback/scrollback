/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function() {
    "use strict";

    // Handle PopOvers
    $(".has-popover").on("click", function() {
        var pclass = $(this).parent(".popover"),
            pbody = $(this).next(".popover-body"),
            pheight = $(pbody).height(),
            pwidth = $(pbody).outerWidth(),
            spaceleft = $(this).offset().left,
            spaceavail = $(this).parent().innerWidth() - pwidth,
            spaceabove = $(this).offset().top - $(document).scrollTop(),
            spacebelow = $(window).height() - spaceabove - pheight;

        if (spaceleft > spaceavail) {
            spaceleft = spaceavail - 28;
            $(pbody).addClass("arrow-right");
        } else if (spaceleft < pwidth / 2 ) {
            $(pbody).addClass("arrow-left");
        }

        if (spacebelow > pheight) {
            $(pbody).addClass("popover-bottom");
        } else if (spaceabove > pheight) {
            $(pbody).addClass("popover-top");
        }

        // Show PopOver
        $(pbody).css("left", spaceleft);
        $(pclass).addClass("popover-active");
        $(pclass).append("<div class='popover-layer'></div>");
        $(".popover-layer").on("click", function() {
            $(pclass).removeClass("popover-active");
            $(pbody).removeClass("popover-bottom").removeClass("popover-top").removeClass("arrow-left").removeClass("arrow-right");
            $(this).remove();
        });
    });

    // Style active states in mobile
    document.addEventListener("touchstart", function() {}, true);
}());
