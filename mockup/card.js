/* jshint browser: true */
/* global $ */

function Card(opts, type) {
    if (typeof opts !== "object") {
        throw new Error("Invalid options passed");
    }

    if (typeof opts.title !== "string" && typeof opts.id !== "string") {
        throw new Error("Invalid title passed");
    }

    this._title = $('<h3 class="card-header-title">').css(opts.color ? {
        color: opts.color
    } : {}).text(opts.title || opts.id);

    this._mentioncount = $('<span class="notification-badge-count">');
    this._mentionbadge = $('<span class="card-header-badge notification-badge notification-badge-mention">').attr("data-empty", "").append(this._mentioncount);
    this._messagecount = $('<span class="notification-badge-count">');
    this._messagebadge = $('<span class="card-header-badge notification-badge notification-badge-messages">').attr("data-empty", "").append(
        $('<span class="icon-communication-message">'),
        this._messagecount
    );

    this.more = $('<a class="card-header-icon card-header-icon-more icon-navigation-more-vert' + (type ? ' action-' + type + '-more' : '') + '">');

    this.element = $('<div class="card' + (type ? ' ' + type + '-card' : '') + '">').append(
        $('<div class="card-header">').append(
            this._title,
            this._mentionbadge,
            this._messagebadge,
            this.more
        )
    );

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

        if (typeof type !== "string" || !this["_" + type + "count"]) {
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

        this["_" + type + "count"].text(text);

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
