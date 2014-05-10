/* jslint browser: true, indent: 4, regexp: true */
/* global $*/

(function() {
    'use strict';

    function gotoPane(i) {
        $("body").removeClass(function(index, css) {
            return (css.match(/(^|\s)step-\S+/g) || []).join(" ");
        }).addClass("step-" + i);
    }

    function changePane(i) {
        $(".action-" + i).on("click", function() {
            var $el = $(this);

            $el.addClass("working");
            $("body").addClass("loading");

            setTimeout(function() {
                $el.removeClass("working");

                gotoPane(i);

            }, 1000);
        });
    }

    for (var i = 1; i < 4; i++) {
        changePane(i);
    }

    $("#skiproom").on("change", function() {
        if ($(this).prop("checked")) {
            $("#roomname").attr("disabled", "disabled");
        } else {
            $("#roomname").removeAttr("disabled");
        }
    });
}());
