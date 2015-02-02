/* jshint browser: true */
/* global $ */

var generate = require('../.././lib/generate.js'),
    $list = $(".chat-area-messages-list");

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
