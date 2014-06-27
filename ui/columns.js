/*jslint browser: true, indent: 4, regexp: true*/
/*global $, libsb*/

$(function() {
    // Navigate between columns
    var adaptLayout = function() {
        var opts = { duration: 300, easing: "ease-out" },
            docW = $(document).width(),
            mainW = $(".main-area").width(),
            metaW = $(".meta-area").width(),
            roomW = $(".room-area").width(),
            $column = $(".column");

        if (window.currentState.view === "meta" && Math.abs(docW - mainW) < 3) {
            $column.velocity({ translateX: metaW }, opts);
        } else if (window.currentState.view === "rooms" && !window.currentState.embed && Math.abs(docW - (mainW + metaW)) < 3) {
            $column.velocity({ translateX: roomW }, opts);
        } else if (window.currentState.view === "rooms" && !window.currentState.embed && Math.abs(docW - mainW) < 3) {
            $column.velocity({ translateX: metaW + roomW }, opts);
        } else {
            $column.velocity({ translateX: 0 }, opts);
        }
    };

    $(".rooms-button").on("click", function() {
        if (window.currentState.view === "rooms") {
            libsb.emit("navigate", { view: "meta", source: "rooms-button" });
        } else {
            libsb.emit("navigate", { view: "rooms", source: "rooms-button" });
        }
    });

    $(".meta-button").on("click", function() {
        if (window.currentState.view === "meta") {
            libsb.emit("navigate", { view: "normal", source: "meta-button" });
        } else {
            libsb.emit("navigate", { view: "meta", source: "meta-button" });
        }
    });

    $(document).on("click", ".list-item, .thread-item", function() {
        libsb.emit("navigate", { view: "normal", source: "meta" });
    });

    // Handle swipe gestures
    $(document).on("swipeleft", function() {
        if (window.currentState.view === "rooms") {
            libsb.emit("navigate", { view: "meta", source: "swipe-left" });
        } else {
            libsb.emit("navigate", { view: "normal", source: "swipe-left" });
        }
    });

    $(document).on("swiperight", function() {
        if (window.currentState.view === "meta" && window.currentState.embed) {
            libsb.emit("navigate", { view: "rooms", source: "swipe-right" });
        } else {
            libsb.emit("navigate", { view: "meta", source: "swipe-right" });
        }
    });

    libsb.on("navigate", function(state, next) {
        if (state.old && state.view !== state.old.view) {
            adaptLayout();
        }

        next();
    }, 500);

    $(window).on("resize", adaptLayout);
});
