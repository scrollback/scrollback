/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function() {
    'use strict';

    function changePane(i) {
        $(".action-" + i).on("click", function() {
            var $el = $(this);

            $el.addClass("working");
            $("body").addClass("loading");

            setTimeout(function() {
                $el.removeClass("working");
                $("body").removeClass().addClass("step-" + i);
            }, 1000);
        });
    }

    for (var i = 1; i < 6; i++) {
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
