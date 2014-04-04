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

    handleReposition();

    $(window).scroll(handleReposition);
    $(window).resize(handleReposition);


    (function() {
        var timeout;
        $(".chat-area").on("scroll", function() {
            if(timeout) clearTimeout(timeout);

            timeout = setTimeout(function(){
                $(".mainview").removeClass("scrolling");
                timeout = 0;
            }, 1000);

            $(".mainview").addClass("scrolling");
        });
    })();

    $(".long").on("click", function () {
        $(this).toggleClass("active").scrollTop(0);
    });

    $(".roomlist").on("click", function () {
        $("body").toggleClass("roomsinview");
    });

    $(".scrollback-header").on("click", function () {
        $("body").removeClass("roomsinview");
    });

    $(".menu, .title").on("click", function () {
        $("body").toggleClass("metainview");
        $("body").removeClass("roomsinview");
    });
}());