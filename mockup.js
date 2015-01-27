/* jshint browser: true */
/* global $ */

"use strict";

var config = require("./client-config-defaults.js"),
    core = new (require("ebus"))(config.appPriorities),
    libsb = require('./interface/interface-client')(core),
    generate = require('./lib/generate.js'),
    View = require("./mockup/view.js"),
    Card = require("./mockup/card.js"),
    Roomcard = require("./mockup/roomcard.js"),
    covers = [
        "https://unsplash.imgix.net/photo-1418226970361-9f1f7227d638?fit=crop&fm=jpg&h=700&q=75&w=1050",
        "https://unsplash.imgix.net/photo-1416184008836-5486f3e2cf58?fit=crop&fm=jpg&q=75&w=1050",
        "https://ununsplash.imgix.net/photo-1413913619092-816734eed3a7?fit=crop&fm=jpg&h=600&q=75&w=1050",
        "https://unsplash.imgix.net/uploads/1413386993023a925afb4/4e769802?fit=crop&fm=jpg&q=75&w=1050",
        "https://ununsplash.imgix.net/uploads/14132599381062b4d4ede/3b6f33f2?fit=crop&fm=jpg&h=700&q=75&w=1050",
        "https://unsplash.imgix.net/reserve/URG2BbWQQ9SAcqLuTOLp_BP7A9947.jpg?fit=crop&fm=jpg&h=700&q=75&w=1050",
        "https://unsplash.imgix.net/reserve/O7A9fAvYSXC7NTdz8gLQ_IMGP1039.jpg?fit=crop&fm=jpg&h=700&q=75&w=1050",
        "https://unsplash.imgix.net/photo-1419332563740-42322047ff09?fit=crop&fm=jpg&h=700&q=75&w=1050",
        "https://unsplash.imgix.net/photo-1416838375725-e834a83f62b7?fit=crop&fm=jpg&h=700&q=75&w=1050",
        "https://ununsplash.imgix.net/uploads/141319062591093cefc09/ad50c1f0?fit=crop&fm=jpg&h=725&q=75&w=1050",
        "https://ununsplash.imgix.net/reserve/eBJIgrh3TCeHf7unLQ5e_sailing-5.jpg?fit=crop&fm=jpg&h=800&q=75&w=1050",
        "https://ununsplash.imgix.net/reserve/unsplash_5288cc8f3571d_1.JPG?fit=crop&fm=jpg&h=700&q=75&w=1050",
        "https://unsplash.imgix.net/photo-1417962798089-0c93ceaed88a?fit=crop&fm=jpg&h=1575&q=75&w=1050",
        "https://unsplash.imgix.net/photo-1415033523948-6c31d010530d?fit=crop&fm=jpg&h=700&q=75&w=1050",
        "https://unsplash.imgix.net/photo-1414924347000-9823c338079b?fit=crop&fm=jpg&h=700&q=75&w=1050"
    ],
    avatars = [
        "http://svgavatars.com/style/svg/01.svg",
        "http://svgavatars.com/style/svg/02.svg",
        "http://svgavatars.com/style/svg/03.svg",
        "http://svgavatars.com/style/svg/04.svg",
        "http://svgavatars.com/style/svg/05.svg",
        "http://svgavatars.com/style/svg/06.svg",
        "http://svgavatars.com/style/svg/07.svg",
        "http://svgavatars.com/style/svg/08.svg",
        "http://svgavatars.com/style/svg/09.svg",
        "http://svgavatars.com/style/svg/10.svg",
        "http://svgavatars.com/style/svg/11.svg",
        "http://svgavatars.com/style/svg/12.svg",
        "http://svgavatars.com/style/svg/13.svg",
        "http://svgavatars.com/style/svg/14.svg",
        "http://svgavatars.com/style/svg/15.svg",
    ];

function addRooms() {
    var grid = new View({ type: "grid" }),
        list = new View({ type: "list" }),
        headers = [ "My rooms", "Following", "Featured" ],
        card1, card2, c  = 0;

    for (var i = 0, l = headers.length; i < l; i++) {
        grid.addHeader(headers[i]);
        list.addHeader(headers[i]);

        for (var j = 0; j < 5; j++) {
            card1 = new Roomcard({
                id: generate.names(Math.floor(Math.random() * 7) + 3),
                color: Math.floor(Math.random() * 10),
                cover: covers[c],
                avatar: avatars[c]
            });

            c += 1;

            card2 = new Card({ id: generate.names(Math.floor(Math.random() * 7) + 3) }, "room");

            for (var k = 0; k < 5; k++) {
                card1.addMessage({
                    count: Math.round((Math.random() * 10) + 1),
                    from: generate.names(Math.floor(Math.random() * 7) + 3),
                    text: generate.sentence(Math.floor(Math.random() * 17) + 3)
                });
            }

            if (Math.random() < 0.5) {
                card1.setCount("mention", Math.round(Math.random() * 100)).setCount("message", Math.round(Math.random() * 100));
                card2.setCount("mention", Math.round(Math.random() * 100));
            }

            grid.addItem(card1.element);
            list.addItem(card2.element);
        }
    }

    grid.element.appendTo(".main-content-rooms");
    list.element.appendTo(".room-list");
}

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
    addRooms();
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
