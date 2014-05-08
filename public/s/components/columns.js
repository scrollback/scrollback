/*jslint browser: true, indent: 4, regexp: true*/
/*global $, libsb*/

$(function() {
    // Navigate between columns
    $(".rooms-button, .scrollback-header").on("click", function() {
        if ($("body").hasClass("rooms-view")) {
            libsb.emit('navigate', { view: "meta", source: "rooms-button" });
        } else {
            libsb.emit('navigate', { view: "rooms", source: "rooms-button" });
        }
    });

    $(".meta-button, .title").on("click", function() {
        if ($("body").hasClass("meta-view")) {
            libsb.emit('navigate', { view: "normal", source: "meta-button" });
        } else {
            libsb.emit('navigate', { view: "meta", source: "meta-button" });
        }
    });

    $(".settings-menu .tab").on("click", function() {
        libsb.emit('navigate', { view: "normal", source: "settings-menu" });
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
                    if ($("body").hasClass("meta-view")) {
                        libsb.emit('navigate', { view: "rooms", source: "swipe-right" });
                    } else {
                        libsb.emit('navigate', { view: "meta", source: "swipe-right" });
                    }
                } else if (currentX < startX) {
                    if ($("body").hasClass("rooms-view")) {
                        libsb.emit('navigate', { view: "meta", source: "swipe-left" });
                    } else {
                        libsb.emit('navigate', { view: "normal", source: "swipe-left" });
                    }
                }

                startTime = 0;
                startX = 0;
            }
        });
    });


    // libsb.on('navigate', function(state, next) {
    //     console.log(state);
    //     if(state.view == "normal") {
    //         $("body").removeClass("meta-view").removeClass("rooms-view");
    //     }
    //     next();
    // },100);
});
