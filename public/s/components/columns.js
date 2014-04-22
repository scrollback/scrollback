/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

$(function() {
    // Move forward and backward within columns
    function columnsGoBack() {
        if ($("body").hasClass("roomsinview")) {
            $("body").removeClass("roomsinview");
        } else {
            $("body").removeClass("metainview");
        }
    }

    function columnsGoForward() {
        if ($("body").hasClass("metainview")) {
            $("body").addClass("roomsinview");
        } else {
            $("body").addClass("metainview");
        }
    }

    // Navigate between columns
    $(".rooms-button, .scrollback-header").on("click", function() {
        if ($("body").hasClass("roomsinview")) {
            columnsGoBack();
        } else {
            columnsGoForward();
        }
    });

    $(".meta-button, .title").on("click", function() {
        if ($("body").hasClass("metainview")) {
            columnsGoBack();
        } else {
            columnsGoForward();
        }
    });

    $(".settings-menu .tab").on("click", function() {
        columnsGoBack();
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
            pointer = "onpointerup" in document,
            touch = "ontouchend" in document,
            startEvent = (pointer) ? 'pointerdown' : (touch) ? 'touchstart' : 'mousedown',
            moveEvent = (pointer) ? 'pointermove' : (touch) ? 'touchmove' : 'mousemove',
            endEvent = (pointer) ? 'pointerup' : (touch) ? 'touchend' : 'mouseup';

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

                if (currentX > startX) {
                    columnsGoForward();
                }

                if (currentX < startX) {
                    columnsGoBack();
                }

                startTime = 0;
                startX = 0;
            }
        });
    });
});
