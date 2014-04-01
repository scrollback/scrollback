/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function () {
    'use strict';

    $(".chat-area").scrollTop($(".chat-area")[0].scrollHeight);

    function handleReposition() {
        if ($(window).scrollTop() >= 5) {
            $(document.body).addClass("scrolled");
        } else {
            $(document.body).removeClass("scrolled");
        }
    }

    $(".tab-heading").on("click", function() {
        $(".tab").not($(this).closest(".tab")).removeClass("tab-active");
        $(this).closest(".tab").addClass("tab-active");
    });

    handleReposition();

    $(window).scroll(handleReposition);
    $(window).resize(handleReposition);
}());