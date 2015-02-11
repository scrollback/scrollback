/* jshint browser: true */
/* global $ */

var View = function(opts) {
    if (!opts) {
        throw new Error("No options passed");
    }

    if (typeof opts.type !== "string" || !opts.type) {
        throw new Error("Invalid type option");
    }

    this.element = $("<div class='" + opts.type + "-view'>");
    this.type = opts.type;

    // Store the section, header and item references
    this._sections = {};
    this._headers = {};
    this._items = {};
};

View.prototype = {
    _getStuff: function(id, type) {
        if (typeof id !== "string") {
            throw new Error("Invalid " + type + " specified");
        }

        return this["_" + type][id];
    },

    _removeStuff: function(id, type) {
        var reference = this.getItem(id, type);

        if (!reference) {
            throw new Error(type + " doesn't exist");
        }

        reference.remove();

        delete this["_" + type][id];
    },

    addSection: function() {
        var $section = $("<ul class='" + this.type + "-section'>"),
            id;

        id = this._current || "section-" + new Date().getTime() + "-" + Math.random().toString(36);

        $section = $("<ul class='" + this.type + "-section'>").attr("data-section", id);

        $section.appendTo(this.element);

        // Store the section reference
        this._sections[id] = $section;

        return id;
    },

    getSection: function(id) {
        this._getStuff(id, "sections");
    },

    removeSection: function(id) {
        this._removeStuff(id, "sections");
    },

    addHeader: function(header) {
        var $header;

        if (typeof header !== "string") {
            throw new Error("Invalid header passed");
        }

        // Add a current ID reference
        this._current = header.toLowerCase().replace(/\s+/g, "-");

        $header = $("<h3 class='" + this.type + "-header'>").attr("data-header", this._current).text(header);

        $header.appendTo(this.element);

        // Store the header reference
        this._headers[this._current] = $header;

        // Add a new section
        return this.addSection();
    },

    getHeader: function(id) {
        this._getStuff(id, "headers");
    },

    removeHeader: function(id) {
        this._removeStuff(id, "headers");
    },

    addItem: function(item, section, position) {
        var $item, id;

        if (section && !this._sections[section]) {
            throw new Error("The section doesn't exist");
        }

        section = section || this._current;

        if (!this._sections[section]) {
            section = this._current = this._current || (new Date().getTime() + "");

            this.addSection();
        }

        id = section + "-item-" + new Date().getTime() + "-" + Math.random().toString(36);

        $item = $("<li class='" + this.type + "-item'>").attr("data-item", id).append(item);

        if (position === "start") {
            $item.prependTo(this._sections[section]);
        } else {
            $item.appendTo(this._sections[section]);
        }

        // Store the item reference
        this._items[id] = $item;

        return id;
    },

    getItem: function(id) {
        this._getStuff(id, "items");
    },

    removeItem: function(id) {
        this._removeStuff(id, "items");
    }
};

module.exports = View;
