/* jshint browser: true */
/* global $ */

var Roomcard = function(room) {
    if (typeof room !== "object") {
        throw new Error("Invalid room object");
    }

    if (typeof room.id !== "string") {
        throw new Error("Invalid room name");
    }

    this._mentioncount = $('<span class="notification-badge-count">');
    this._mentionbadge = $('<span class="room-card-header-badge notification-badge notification-badge-mention">').attr("data-empty", "").append(this._mentioncount);
    this._messagecount = $('<span class="notification-badge-count">');
    this._messagebadge = $('<span class="room-card-header-badge notification-badge notification-badge-messages">').attr("data-empty", "").append(
        $('<span class="icon-communication-message">'),
        this._messagecount
    );

    this.more = $('<a class="room-card-header-icon room-card-header-icon-more icon-navigation-more-vert">');

    this.element = $('<div class="room-card">').append(
        $('<div class="room-card-header">').append(
            $('<h3 class="room-card-header-title">').text(room.id),
            this._mentionbadge,
            this._messagebadge,
            this.more
        )
    ).attr("data-room", room.id);

    this.room = room;
};

Roomcard.prototype = {
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
            this._content = $('<div class="room-card-content">');
            this._content.appendTo(this.element);
        }

        this._content.append(
            $('<div class="room-card-discussion">').append(
                $('<span class="room-card-discussion-nick">').text(message.from),
                $('<span class="room-card-discussion-message">').text(message.text)
            )
        );

        return this;
    }
};

module.exports = Roomcard;
