/* jshint browser: true */
/* global $ */

"use strict";

var config = require("./client-config-defaults.js"),
    core = new (require("ebus"))(config.appPriorities),
    libsb = require('./interface/interface-client')(core),
    generate = require('./lib/generate.js'),
    View = require("./mockup/view.js"),
    Card = require("./mockup/card.js");

function addRooms() {
    var listgrid = new View({ type: "listgrid" }),
        headers = [ "My rooms", "Following", "Featured" ],
        card;

    for (var i = 0, l = headers.length; i < l; i++) {
        listgrid.addHeader(headers[i]);

        for (var j = 0; j < 5; j++) {
            card = new Card({
                id: generate.names(Math.floor(Math.random() * 7) + 3),
                color: "#" + Math.floor(Math.random() * 16777215).toString(16)
            }, "room");

            for (var k = 0; k < 5; k++) {
                card.addMessage({
                    from: generate.names(Math.floor(Math.random() * 7) + 3),
                    text: generate.sentence(Math.floor(Math.random() * 17) + 3)
                });
            }

            card.setCount("mention", Math.round(Math.random() * 100)).setCount("message", Math.round(Math.random() * 100));

            listgrid.addItem(card.element);
        }
    }

    listgrid.element.appendTo(".main-content-rooms");
}

function addDiscussions() {
    var grid = new View({ type: "grid" }),
        card;

    for (var j = 0; j < 12; j++) {
        card = new Card({
            title: generate.sentence(Math.floor(Math.random() * 7) + 3),
            id: generate.names(Math.floor(Math.random() * 7) + 3),
            color: "#" + Math.floor(Math.random() * 16777215).toString(16)
        }, "discussion");

        for (var k = 0; k < 5; k++) {
            card.addMessage({
                from: generate.names(Math.floor(Math.random() * 7) + 3),
                text: generate.sentence(Math.floor(Math.random() * 17) + 3)
            });
        }

        grid.addItem(card.element);
    }

    grid.element.appendTo(".main-content-discussions");
}

$(function() {
    var keys = [ "view", "mode" ],
        oldState = {}, currentState = {};

    // Listen to navigate and add class names
    libsb.on("navigate", function(state) {
        var classList;

        oldState = $.extend({}, currentState);

        for (var s in state) {
            if (state[s] !== null) {
                currentState[s] = state[s];
            } else {
                delete currentState[s];
            }
        }

        classList = $("body").attr("class") || "";

        for (var i = 0, l = keys.length; i < l; i++) {
            if (currentState[keys[i]] !== oldState[keys[i]]) {
                classList = classList.replace(new RegExp("\\b" + keys[i] + "-" + "\\S+", "g"), "");

                if (keys[i] in currentState) {
                    classList += " " + keys[i] + "-" + (currentState[keys[i]] || "");
                }
            }
        }

        classList = classList.replace(/^\s+|\s+$/g, "");

        $("body").attr("class", classList);
    }, 1000);

    // Send initial navigate
    libsb.emit("navigate", { mode: "home" });

    // Generate room names
    addRooms();
    addDiscussions();

    $(".action-sidebar-open").on("click", function() {
        libsb.emit("navigate", { view: "sidebar-left" });
    });

    $(".action-sidebar-close").on("click", function() {
        libsb.emit("navigate", { view: null });
    });

    $(document).on("click", ".room-card", function(e) {
        if ($(e.target).closest(".action-room-more").length) {
            return;
        }

        libsb.emit("navigate", {
            mode: "room",
            roomName: $(this).attr("data-room")
        });
    });
});
