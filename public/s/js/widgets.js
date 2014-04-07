/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function() {
    "use strict";

    // Handle PopOver
    $(function() {
        var popoverclass = ".popover",
            popoverbody = ".popover-body",
            popoverlayer = ".popover-layer",
            popoveritem = ".has-popover";

        // Hide popover
        function hidePopOver() {
            $(popoveritem).parent(popoverclass).removeClass("popover-active");
            $(popoverbody).removeClass("popover-bottom").removeClass("popover-top");
            $(popoverlayer).remove();
        }

        // Show popover
        function showPopOver() {
            $("body").append("<div class='popover-layer'></div>");
            $(this).parent(popoverclass).addClass("popover-active");
            $(popoverlayer).on("click", hidePopOver);

            var popoverheight = $(popoverbody).height(),
                spaceabove = $(popoverclass).offset().top - $(document).scrollTop() + 60,
                spacebelow = $(window).height() - spaceabove - popoverheight + 60;

            if (spacebelow > popoverheight) {
                $(popoverbody).addClass('popover-bottom');
            } else if (spaceabove > popoverheight) {
                $(popoverbody).addClass('popover-top');
            }
        }

        $(popoveritem).on("click", showPopOver);
    });

    // Style active states in mobile
    document.addEventListener("touchstart", function() {}, true);

}());
