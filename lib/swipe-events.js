/* jslint browser: true */
/* global $ */

$(function() {
    var maxTime = 1000,
        maxDistance = 500,
        minDistance = 20,
        target = $("body"),
        startX = 0,
        startY = 0,
        startTime = 0,
        pointer = "onpointerup" in document,
        touch = "ontouchstart" in document,
        startEvent = pointer ? "pointerdown" : touch ? "touchstart" : "mousedown",
        moveEvent = pointer ? "pointermove" : touch ? "touchmove" : "mousemove",
        endEvent = pointer ? "pointerup" : touch ? "touchend" : "mouseup";

    target.on(startEvent, function(e) {
        startTime = (new Date()).getTime();
        startX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX : e.pageX;
        startY = e.originalEvent.touches ? e.originalEvent.touches[0].pageY : e.pageY;
    }).on(endEvent, function() {
        startTime = 0;
        startX = 0;
        startY = 0;
    }).on(moveEvent, function(e) {
        var currentX = e.originalEvent.touches ? e.originalEvent.touches[0].pageX : e.pageX,
            currentY = e.originalEvent.touches ? e.originalEvent.touches[0].pageY : e.pageY,
            currentDistanceX = (startX === 0) ? 0 : Math.abs(currentX - startX),
            currentDistanceY = (startY === 0) ? 0 : Math.abs(currentY - startY),
            currentTime = (new Date()).getTime();

        if (startTime !== 0 && currentTime - startTime < maxTime &&
            currentDistanceX > currentDistanceY && currentDistanceX < maxDistance && currentDistanceX > minDistance) {

            if (currentX > startX) {
                $.event.trigger({
                    type: "swiperight",
                    time: new Date()
                });
            } else if (currentX < startX) {
                $.event.trigger({
                    type: "swipeleft",
                    time: new Date()
                });
            }

            startTime = 0;
            startX = 0;
        }
    });
});
