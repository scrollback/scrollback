/*jslint browser: true, indent: 4, regexp: true*/
/*global $, libsb*/

$(function() {
    // Navigate between columns
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
        if (window.currentState.view === "meta" && !(window.currentState.embed && window.currentState.embed.form)) {
            libsb.emit("navigate", { view: "rooms", source: "swipe-right" });
        } else {
            libsb.emit("navigate", { view: "meta", source: "swipe-right" });
        }
    });
});
