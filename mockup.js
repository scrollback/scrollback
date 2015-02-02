/* jshint browser: true */
/* global $ */

"use strict";

var config = require("./client-config-defaults.js"),
    core = new (require("ebus"))(config.appPriorities),
    libsb = require('./interface/interface-client')(core),
    data = require("./mockup/store/data.json"),
    generate = require('./lib/generate.js'),
    View = require("./mockup/views/view.js"),
    Card = require("./mockup/views/card.js");

window.core = core;

require("./mockup/store/state-manager.js");
require("./mockup/components/roomlist.js");
require("./mockup/components/user.js");
require("./mockup/components/people.js");

window.currentState = data; // FIXME: should set to empty schema

// Send the initial setstate event
core.emit("setstate", data, function() {
    window.currentState = data;
});

function addDiscussions() {
    var grid = new View({ type: "grid" }),
        card, c = 0;

    grid.addHeader("Discussions");

    for (var j = 0; j < 12; j++) {
        card = new Card({
            title: generate.sentence(Math.floor(Math.random() * 7) + 3),
            id: generate.names(Math.floor(Math.random() * 7) + 3),
            color: c
        }, "discussion");

        c = (c < 9) ? (c + 1) : 0;

        for (var k = 0; k < 5; k++) {
            card.addMessage({
                from: generate.names(Math.floor(Math.random() * 7) + 3),
                text: generate.sentence(Math.floor(Math.random() * 17) + 3)
            });
        }

        card.setCount("mention", Math.round(Math.random() * 100));

        card.element.append($('<div class="card-quick-reply js-quick-reply">').append(
                                $('<div class="card-quick-reply-content">').append(
                                    $('<div class="card-button card-button-reply">Quick reply</div>'),
                                    $('<input type="text" class="card-entry card-entry-reply js-quick-reply-entry">')
                            )));

        grid.addItem(card.element);
    }

    grid.element.appendTo(".main-content-discussions");
}

function addPeople() {
    var list = new View({ type: "list" }),
        headers = [ "Online (3)", "Offline (5)" ];

    for (var i = 0, l = headers.length; i < l; i++) {
        list.addHeader(headers[i]);

        for (var j = 0; j < 5; j++) {
            list.addItem($('<div class="people-list-item">').append(
                            $('<img class="people-list-item-avatar">').attr("src", "https://secure.gravatar.com/avatar/" + generate.names(Math.floor(Math.random() * 30) + 3)+ "?d=identicon&s=48"),
                            $('<span class="people-list-item-nick">').text(generate.names(Math.floor(Math.random() * 7) + 3))
                         ));
        }
    }

    list.element.appendTo(".people-list");
}

function addChat() {
    var $list = $(".chat-area-messages-list");

    setInterval(function() {
        setTimeout(function() {
            var $chat = $('<div class="chat-item">').append(
                            $('<div class="chat-item-nick">').text(generate.names(Math.floor(Math.random() * 7) + 3)),
                            $('<div class="chat-item-message">').text(generate.sentence(Math.floor(Math.random() * 17) + 3))
                         );

            $list.append($chat);

            $chat.get(0).scrollIntoView(true);
        }, 1000 * Math.random());
    }, 1000);
}

$(function() {
    var keys = [ "view", "mode", "color" ],
        oldState = {}, currentState = {},
        $title = $(".js-appbar-title"),
        $discussion = $(".js-discussion-title");

    // Listen to navigate and add class names
    libsb.on("navigate", function(state, next) {
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

        next();
    }, 1000);

    libsb.on("navigate", function(state, next) {
        var classList = $("body").attr("class").trim() || "";

        classList = classList.replace(/\bcolor-\S+/g, "");

        if (state && oldState && state.mode !== oldState.mode) {
            switch (state.mode) {
            case "room":
                $title.text(state.roomName);
                break;
            case "chat":
                classList += " color-" + state.color;
                $title.text(state.roomName);
                $discussion.text(state.discussionId);
                break;
            case "home":
                $title.text("My feed");
                break;
            }
        }

        $("body").attr("class", classList);

        next();
    }, 500);

    // Send initial navigate
    libsb.emit("navigate", { mode: "home" });

    // Generate room names
    addDiscussions();
    addPeople();
    addChat();

    $(".js-sidebar-left-open").on("click", function() {
        libsb.emit("navigate", { view: "sidebar-left" });
    });

    $(".js-sidebar-right-open").on("click", function() {
        libsb.emit("navigate", { view: "sidebar-right" });
    });

    $(".js-sidebar-close").on("click", function() {
        libsb.emit("navigate", { view: null });
    });

    $(".js-goto-room").on("click", function() {
        libsb.emit("navigate", {
            mode: "room",
            view: null
        });
    });

    $(".js-goto-home").on("click", function() {
        libsb.emit("navigate", {
            mode: "home",
            view: null
        });
    });

    $(".js-follow-room").on("click", function() {
        $("body").toggleClass("role-follower");
    });

    $(document).on("click", ".js-room-card", function(e) {
        if ($(e.target).closest(".js-room-more").length) {
            return;
        }

        libsb.emit("navigate", {
            mode: "room",
            roomName: $(this).attr("data-room"),
            view: null
        });
    });

    $(document).on("click", ".js-discussion-card", function(e) {
        var $target = $(e.target),
            $quickreply;

        if ($target.closest(".js-discussion-more").length) {
            return;
        }

        $quickreply = $target.closest(".js-quick-reply");

        if ($quickreply.length) {
            $quickreply.addClass("active");

            setTimeout(function() {
                $quickreply.find(".js-quick-reply-entry").focus();
            }, 200);

            return;
        }

        libsb.emit("navigate", {
            mode: "chat",
            discussionId: $(this).attr("data-discussion"),
            color: $(this).attr("data-color"),
            view: null
        });
    });

    $(document).on("blur", ".js-quick-reply-entry", function() {
        $(this).closest(".js-quick-reply").removeClass("active");
    });
});
