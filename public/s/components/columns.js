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
    $(document).on("swipeleft", function() {
        if ($("body").hasClass("rooms-view")) {
            libsb.emit('navigate', { view: "meta", source: "swipe-left" });
        } else {
            libsb.emit('navigate', { view: "normal", source: "swipe-left" });
        }
    });

    $(document).on("swiperight", function() {
        if ($("body").hasClass("meta-view")) {
            libsb.emit('navigate', { view: "rooms", source: "swipe-right" });
        } else {
            libsb.emit('navigate', { view: "meta", source: "swipe-right" });
        }
    });


    // libsb.on('navigate', function(state, next) {
    //     console.log(state);
    //     if(state.view == "normal") {
    //         $("body").removeClass("meta-view").removeClass("rooms-view");
    //     }
    //     next();
    // },100);
});
