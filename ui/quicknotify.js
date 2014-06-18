/* jshint browser: true */
/* global $, lace */

lace.quicknotify = {
    /**
     * Show an notify message.
     * @constructor
     * @param {{ type: String, text: String, id: String, timeout: Number }} notify
     */
    show: function(notify) {
        if (!notify.type) {
            notify.type = "info";
        }

        if (!notify.id) {
            notify.id = "quick-notification-" + new Date().getTime();
        }

        var $quicknotification = $("#" + notify.id),
            $container = $(".quick-notification-container");

        if (!$container.length) {
            $container = $("<div>").addClass("quick-notification-container");
            $container.appendTo("body");
        }

        if ($quicknotification.length && $quicknotification.hasClass("quick-notification-item")) {
            lace.quicknotify.hide($quicknotification);
        }

        $quicknotification = $("<div>")
            .addClass("quick-notification-item " + notify.type)
            .attr("id", notify.id)
            .text(notify.text);

        $quicknotification.appendTo($container);

        if (typeof notify.timeout == "number") {
            setTimeout(function() {
                lace.quicknotify.hide($quicknotification);
            }, notify.timeout);
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

        lace.animate.transition("fadeout", $element, function() {
            $(this).remove();

            if (!$container.children().length) {
                $container.remove();
            }
        });
    }
};
