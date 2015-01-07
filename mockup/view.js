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
};

View.prototype = {
    addHeader: function(header) {
        var $header = $("<h3 class='" + this.type + "-header'>").text(header);

        $header.appendTo(this.element);

        // Invalidate current content reference
        this._content = null;

        return this;
    },

    addContent: function() {
        var $content = $("<ul class='" + this.type + "-content'>");

        $content.appendTo(this.element);

        // Store the current content reference
        this._content = $content;

        return this;
    },

    addItem: function(item) {
        var $item = $("<li class='" + this.type + "-item'>").append(item);

        if (!this._content) {
            this.addContent();
        }

        $item.appendTo(this._content);

        return this;
    }
};

module.exports = View;
