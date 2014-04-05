/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function () {
    'use strict';

    // Scroll to bottom of the messages on page load
    $(".chat-area").scrollTop($(".chat-area")[0].scrollHeight);

    // Make our app fullscreen
    $(function hideAddressBar() {
        if(!window.location.hash) {
            if(document.height <= window.outerHeight + 10) {
                document.body.style.height = (window.outerHeight + 50) +'px';
                setTimeout(function() {
                    window.scrollTo(0, 1);
                }, 50 );
            } else {
                setTimeout(function() {
                    window.scrollTo(0, 1);
                }, 0 );
            }
        }
    });

    // Add a class while scrolling so we can do cool stuff
    $(function() {
        var timeout;

        $(".chat-area").on("scroll", function() {
            if(timeout) clearTimeout(timeout);

            timeout = setTimeout(function(){
                $(".mainview").removeClass("scrolling");
                timeout = 0;
            }, 1000);

            $(".mainview").addClass("scrolling");
        });
    });

    // Show and hide panes in responsive view
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

    // Handle swipe gestures (requires jQuery mobile touch events component)
    $("body").on("swiperight", function () {
        if ($("body").hasClass("metainview")) {
            $("body").addClass("roomsinview");
        } else {
            $("body").addClass("metainview");
        }
    });

    $("body").on("swipeleft", function () {
        if ($("body").hasClass("roomsinview")) {
            $("body").removeClass("roomsinview");
        } else {
            $("body").removeClass("metainview").removeClass("roomsinview");
        }
    });
}());