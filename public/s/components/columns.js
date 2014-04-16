/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

$(function() {
    // Show and hide panes in responsive view
    $(".rooms-btn, .scrollback-header").on("click", function() {
        $("body").toggleClass("roomsinview");
    });

    $(".meta-btn, .title").on("click", function() {
        $("body").toggleClass("metainview");
    });

    $(".settings-menu .tab").on("click", function() {
        $("body").removeClass("metainview");
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
});
