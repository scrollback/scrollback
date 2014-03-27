/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function () {
    "use strict";

    $(function () {
        var popoverclass = ".popover";
        var popoverlayer = ".popover-layer";
        var popoverparent = ".has-popover";

        // Show popover
        function showPopOver() {
            $("body").append("<div class='popover-layer'></div>");
            $(popoverparent).addClass("popover-active");
            $(popoverlayer).on("click", hidePopOver);

            var popoverheight = $(popoverclass).height();
            var spaceabove = $(popoverparent).offset().top - $(document).scrollTop() + 20;
            var spacebelow = $(window).height() - spaceabove - popoverheight + 20;

            console.log(spaceabove);
            console.log(spacebelow);

            if (spacebelow > popoverheight) {
                $(popoverclass).addClass('popover-bottom');
            } else if (spaceabove > popoverheight) {
                $(popoverclass).addClass('popover-top');
            }
        }

        // Hide popover
        function hidePopOver() {
            $(popoverparent).removeClass("popover-active");
            $(popoverclass).removeClass("popover-bottom").removeClass("popover-top");
            $(popoverlayer).remove();
        }

        $(popoverparent).on("click", showPopOver);
    });

    // Style active states in mobile
    document.addEventListener("touchstart", function () {}, true);

}());