/* jshint browser: true */
/* global $ */

function Card(opts, type) {
    var title;

    if (typeof opts !== "object") {
        throw new Error("Invalid options passed");
    }

    title = opts.title || opts.id;

    if (typeof title !== "string") {
        throw new Error("Invalid title passed");
    }

    this._title = $('<h3 class="card-header-title">').text(title);

    this._mentionbadge = $('<span class="card-header-badge notification-badge notification-badge-mention">').attr("data-empty", "");
    this._messagebadge = $('<span class="card-header-badge notification-badge notification-badge-messages">').attr("data-empty", "");

    this.more = $('<a class="card-header-icon card-header-icon-more' + (type ? ' action-' + type + '-more' : '') + '">');

    this.element = $('<div class="card' + (type ? ' ' + type + '-card ' + 'js-' + type + '-card' : '') + '">').append(
        $('<div class="card-header">').append(
            this._title,
            this._mentionbadge,
            this._messagebadge,
            this.more
        )
    ).attr("data-color", (typeof opts.color !== "undefined") ? opts.color : '');

    if (type) {
        this.element.attr("data-" + type, title);
    }

    this.id = opts.id;
}

Card.prototype = {
    setTitle: function(text) {
        if (typeof text !== "string") {
            throw new Error("Invalid title specified");
        }

        this._title.text(text);

        return this;
    },
    setCount: function(type, text) {
        var $badge;

        if (typeof type !== "string" || !this["_" + type + "badge"]) {
            throw new Error("Invalid property specified");
        }

        if (typeof text !== "string" && typeof text !== "number") {
            throw new Error("Invalid value");
        }

        $badge = this["_" + type + "badge"];

        if (text) {
            $badge.removeAttr("data-empty");
        } else {
            $badge.attr("data-empty", true);
        }

        $badge.text(text);

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

module.exports = Card;
