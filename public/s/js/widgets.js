/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function () {
    "use strict";

    // Handle PopOver
    $(function () {
        var popoverclass = ".popover",
            popoverlayer = ".popover-layer",
            popoverparent = ".has-popover";

        // Hide popover
        function hidePopOver() {
            $(popoverparent).removeClass("popover-active");
            $(popoverclass).removeClass("popover-bottom").removeClass("popover-top");
            $(popoverlayer).remove();
        }

        // Show popover
        function showPopOver() {
            $("body").append("<div class='popover-layer'></div>");
            $(popoverparent).addClass("popover-active");
            $(popoverlayer).on("click", hidePopOver);

            var popoverheight = $(popoverclass).height(),
                spaceabove = $(popoverparent).offset().top - $(document).scrollTop() + 20,
                spacebelow = $(window).height() - spaceabove - popoverheight + 20;

            if (spacebelow > popoverheight) {
                $(popoverclass).addClass('popover-bottom');
            } else if (spaceabove > popoverheight) {
                $(popoverclass).addClass('popover-top');
            }
        }

        $(popoverparent).on("click", showPopOver);
    });

    // Style active states in mobile
    document.addEventListener("touchstart", function () {}, true);

}());
