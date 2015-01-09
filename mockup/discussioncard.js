/* jshint browser: true */
/* global $ */

var Card = require("./card.js");

function Discussioncard = function(opts) {
    if (typeof opts !== "object") {
        throw new Error("Invalid options passed");
    }

    if (typeof opts.title !== "string") {
        throw new Error("Invalid discussion title");
    }

    this._title = $('<h3 class="card-header-title">').css({
        color: "#" + Math.floor(Math.random() * 16777215).toString(16)
    }).text(opts.title);

    this._mentioncount = $('<span class="notification-badge-count">');
    this._mentionbadge = $('<span class="card-header-badge notification-badge notification-badge-mention">').attr("data-empty", "").append(this._mentioncount);
    this._messagecount = $('<span class="notification-badge-count">');
    this._messagebadge = $('<span class="card-header-badge notification-badge notification-badge-messages">').attr("data-empty", "").append(
        $('<span class="icon-communication-message">'),
        this._messagecount
    );

    this.more = $('<a class="action-discussion-more card-header-icon-more card-header-icon icon-navigation-more-vert">');

    this.element = $('<div class="discussion-card card">').append(
        $('<div class="card-header">').append(
            this._title,
            this._mentionbadge,
            this._messagebadge,
            this.more
        )
    ).attr("data-discussion", opts.id);

    this.discussion = opts.title;
    this.id = opts.id;
};

Discussioncard.prototype = {
    setTitle: function(text) {
        if (typeof text !== "string") {
            throw new Error("Invalid title specified");
        }

        this._title.text(text);

        return this;
    },
    addMessage: function(message) {
        if (typeof message !== "object") {
            throw new Error("Invalid message");
        }

        if (typeof message.from !== "string") {
            throw new Error("Invalid 'from' property in message");
        }

        if (typeof message.text !== "string") {
            throw new Error("Invalid 'text' property in message");
        }

        if (!this._content) {
            this._content = $('<div class="card-content">');
            this._content.appendTo(this.element);
        }

        this._content.append(
            $('<div class="card-chat">').append(
                $('<span class="card-chat-nick">').text(message.from),
                $('<span class="card-chat-message">').text(message.text)
            )
        );

        return this;
    }
};

module.exports = Discussioncard;
