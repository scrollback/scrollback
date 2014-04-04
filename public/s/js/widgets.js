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

    // Handle tabs
    $(function () {
        var tabs = [];

        $(".tabs > li").each(function () {
            var classlist = $(this).attr('class').split(/ +/);

            for (var i = 0; i < classlist.length; i++) {
                if (classlist[i].length > 0 && classlist[i].match(/^tab-([a-z]+)$/)) {
                    tabs.push(classlist[i]);
                }
            }
        });

        $(".tabs > li").on("click", function () {
            if (!$(this).hasClass("notab")) {
                for (var i = 0; i < tabs.length; i++) {
                    if ($(this).hasClass(tabs[i])) {
                        $("." + tabs[i]).addClass("current");
                    } else {
                        $("." + tabs[i]).removeClass("current");
                    }
                }
            }
        });
    });

    // Style active states in mobile
    document.addEventListener("touchstart", function () {}, true);

}());