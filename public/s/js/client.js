/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

(function() {
    'use strict';

    // Scroll to bottom of the messages on page load
    $(".chat-area").scrollTop($(".chat-area")[0].scrollHeight);

    // Add a class while scrolling so we can do cool stuff
    $(function() {
        var timeout;

        $(".chat-area").on("scroll", function() {
            if(timeout) clearTimeout(timeout);

            timeout = setTimeout(function(){
                $("body").removeClass("scrolling");
                timeout = 0;
            }, 1000);

            $("body").addClass("scrolling");
        });
    });

    // Handle tabs
    $(function() {
        var tabs = [];

        $(".tabs > li").each(function() {
            var classlist = $(this).attr('class').split(/ +/);

            for (var i = 0; i < classlist.length; i++) {
                if (classlist[i].length > 0 && classlist[i].match(/^tab-([a-z]+)$/)) {
                    tabs.push(classlist[i]);
                }
            }
        });

        $(".tabs > li").on("click", function() {
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

    // Expand long messages
    $(".long").on("click", function() {
        $(this).toggleClass("active").scrollTop(0);
    });

    // Show and hide panes in responsive view
    $(".roomlist, .scrollback-header").on("click", function() {
        $("body").toggleClass("roomsinview");
    });

    $(".menu, .title").on("click", function() {
        $("body").toggleClass("metainview");
        $("body").removeClass("roomsinview");
    });

    // Handle swipe gestures
    $(function() {
        var maxTime = 1000,
            maxDistance = 500,
            minDistance = 10,
            target = $("body"),
            startX = 0,
            startY = 0,
            startTime = 0,
            touch = "ontouchend" in document,
            startEvent = (touch) ? 'touchstart' : 'mousedown',
            moveEvent = (touch) ? 'touchmove' : 'mousemove',
            endEvent = (touch) ? 'touchend' : 'mouseup';

        target.bind(startEvent, function(e) {
            startTime = (new Date()).getTime();
            startX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX : e.pageX;
            startY = e.originalEvent.touches ? e.originalEvent.touches[0].pageY : e.pageY;
        }).bind(endEvent, function() {
            startTime = 0;
            startX = 0;
            startY = 0;
        }).bind(moveEvent, function(e) {
            var currentX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX : e.pageX,
                currentY = e.originalEvent.touches ? e.originalEvent.touches[0].pageY : e.pageY,
                currentDistanceX = (startX === 0) ? 0 : Math.abs(currentX - startX),
                currentDistanceY = (startY === 0) ? 0 : Math.abs(currentY - startY),
                currentTime = (new Date()).getTime();

            if (startTime !== 0 && currentTime - startTime < maxTime && currentDistanceX > currentDistanceY && currentDistanceX < maxDistance && currentDistanceX > minDistance) {

                if (currentX < startX) {
                    if ($("body").hasClass("roomsinview")) {
                        $("body").removeClass("roomsinview");
                    } else {
                        $("body").removeClass("metainview");
                    }
                }

                if (currentX > startX) {
                    if ($("body").hasClass("metainview")) {
                        $("body").addClass("roomsinview");
                    } else {
                        $("body").addClass("metainview");
                    }
                }

                startTime = 0;
                startX = 0;
            }
        });
    });
}());
