/* jshint browser: true */
/* global $ */

var lace = require("../lib/lace.js"),
    quicknotify = {
    /**
     * Show an notify message.
     * @constructor
     * @param {{ type: String, text: String, id: String, timeout: Number }} options
     */
    show: function(options) {
        var notify = this,
            $quicknotification,
            $container = $(".quick-notification-container");

        if (!options.type) {
            options.type = "info";
        }

        if (!options.id) {
            options.id = "quick-notification-" + new Date().getTime();
        }

        $quicknotification = $("#" + options.id);

        if (!$container.length) {
            $container = $("<div>").addClass("quick-notification-container");
            $container.appendTo(".main-area");
        }

        if ($quicknotification.length && $quicknotification.hasClass("quick-notification-item")) {
            notify.hide($quicknotification);
        }

        $quicknotification = $("<div>")
            .addClass("quick-notification-item " + options.type)
            .attr("id", options.id)
            .text(options.text);

        $quicknotification.appendTo($container);

        if (typeof options.timeout == "number") {
            setTimeout(function() {
                notify.hide($quicknotification);
            }, options.timeout);
        }

        return $quicknotification;
    },

    /**
    * Hide notify message(s).
    * @constructor
    * @param {String} [element]
    */
    hide: function(element) {
        var $element,
            $container = $(".notify-container");

        if (element) {
            $element = $(element);
        } else {
            $element = $(".quick-notification-item");
        }

        if (!$element.hasClass("quick-notification-item")) {
            return;
        }

        lace.animate("fadeOut", $element, function() {
            $(this).remove();

            if (!$container.children().length) {
                $container.remove();
            }
        });
    }
};

module.exports = quicknotify;
