/* jslint browser: true, indent: 4, regexp: true */
/* global $, lace, Notification, webkitNotifications */
/* exported lace */

/**
 * @fileOverview Various UI components.
 * @author <a href="mailto:satyajit.happy@gmail.com">Satyajit Sahoo</a>
 * @requires jQuery
 */

window.lace = {
    animate: {
        /**
         * Add a class to an element and execute an action after transition.
         * @constructor
         * @param {String} classname
         * @param {String} element
         * @callback action
         */
        transition: function(classname, element, action) {
            if (typeof document.body.style.transition === 'string') {
                $(element).addClass(classname).data("transitioning", true);

                $(element).on("transitionend webkitTransitionEnd msTransitionEnd oTransitionEnd", function(e) {
                    if (e.target === e.currentTarget && $(this).data("transitioning")) {
                        $(element).removeClass(classname).data("transitioning", false);
                        action();
                    }
                });
            } else {
                action();
            }
        }
    },

    multientry: {
        /**
         * Add event handlers for multientry.
         * @constructor
         */
        init: function() {
            $(document).on("keydown", ".multientry .item", function(e) {
                if (e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 188) {
                    e.preventDefault();
                    lace.multientry.add($(this), $(this).text());
                }
            });

            $(document).on("paste", ".multientry .item", function(e) {
                e.preventDefault();

                var items = e.originalEvent.clipboardData.getData('Text').split(/[\s,]+/);

                for (var i = 0; i < items.length; i++) {
                    lace.multientry.add($(this), items[i]);
                }
            });

            $(document).on("keydown", ".multientry .item", function(e) {
                if (e.keyCode === 8 && $(this).text().match(/^\s*$/)) {
                    lace.multientry.remove($(this).prev());
                }
            });

            $(document).on("click", ".multientry .item-remove", function() {
                lace.multientry.remove($(this).parent());
            });

            $(document).on("click", ".multientry", function() {
                $(this).children().last().focus();
            });
        },

        /**
         * Add an item to multientry.
         * @constructor
         * @param {String} element
         * @param {String} text
         */
        add: function(element, text) {
            if (!text.match(/^\s*$/) ) {
                $("<div class='item done'><span class='item-text'>" + text.trim() + "</span><span class='item-remove close'>&times;</span></div>").insertBefore($(element).empty());
            }
        },

        /**
         * Remove an item from multientry.
         * @constructor
         * @param {String} [element]
         */
        remove: function(element) {
            if (!element) {
                element = ".multientry .item";
            }

            $(element).remove();
        },

        /**
         * Get items from multientry.
         * @constructor
         * @param {String} element
         * @return {String[]}
         */
        items: function(element) {
            var elems = $(element).find(".item-text"),
                items = new Array(elems.length);

            for (var i = 0; i < elems.length; i++) {
                items[i] = $(elems[i]).text();
            }

            return items;
        }
    },

    modal: {
        /**
         * Show a modal dialog.
         * @constructor
         * @param {String} content
         */
        show: function(content) {
            var modal = $('<div class="modal">' + content + '</div>');

            $("body").append("<div class='dim'></div>").append(modal);

            modal.css({
                "margin-top" : modal.outerHeight() / -2,
                "margin-left" : modal.outerWidth() / -2
            });

            if (modal.find(".modal-remove").length === 0) {
                $(".dim").on("click", lace.modal.hide);
            }

            $(".modal-remove").on("click", lace.modal.hide);
            $(window).on("popstate", lace.modal.hide);
        },

        /**
         * Hide modal dialog(s).
         * @constructor
         */
        hide: function() {
            [".dim", ".modal"].forEach(function(el) {
                lace.animate.transition("fadeout", el, function() {
                    $(el).remove();
                });
            });
        }
    },

    popover: {
        /**
         * Show a PopOver.
         * @constructor
         * @param {String} element
         * @param {String} content
         */
        show: function(element, content) {
            var popover = ".popover-body",
                spacetop = $(element).offset().top - $(document).scrollTop() + $(element).height(),
                spacebottom = $(window).height() - spacetop,
                spaceleft = $(element).offset().left - $(document).scrollLeft() + ( $(element).width() / 2 ),
                spaceright = $(window).width() - spaceleft;

            $("body").append("<div class='layer'></div>").append($('<div role="menu" class="' + popover.substr(1) + '">' + content + '</div>'));

            if ($(popover).outerWidth() >= spaceleft) {
                $(popover).addClass("arrow-left");
                spaceleft = $(element).width() / 2;
            } else if ($(popover).outerWidth() >= spaceright) {
                $(popover).addClass("arrow-right");
                spaceleft = $(window).width() - ( $(element).width() / 2 ) - $(popover).outerWidth();
            } else {
                spaceleft = spaceleft - ( $(popover).outerWidth() / 2 );
            }

            if ($(element).height() >= $(window).height()) {
                $(popover).addClass("popover-bottom");
                spacetop = $(window).height() / 2;
            } else if ($(popover).outerHeight() >= spacebottom) {
                $(popover).addClass("popover-top");
                spacetop = spacetop - $(element).height() - $(popover).outerHeight();
            } else {
                $(popover).addClass("popover-bottom");
            }

            $(popover).css({
                "top" : spacetop,
                "left" : spaceleft
            });

            $(".layer").on("click", lace.popover.hide);
        },

        /**
         * Hide PopOver(s).
         * @constructor
         */
        hide: function() {
            lace.animate.transition("fadeout", ".popover-body", function() {
                $(".popover-body, .layer").remove();
            });
        }
    },

    alert: {
        /**
         * Show an alert message.
         * @constructor
         * @param {{ type: String, body: String, id: String, timeout: Number }} alert
         */
        show: function(alert) {
            if (!alert.type) {
                alert.type = "info";
            }

            if (!alert.id) {
                alert.id = new Date().getTime();
            }

            var container = ".alert-container",
                banner = "<div id='" + alert.id + "' class='alert-bar " + alert.type + "'><span class='alert-content'>" + alert.body + "</span><a class='alert-remove close'>&times;</a></div>";

            if ($(container).length === 0) {
                $("body").append("<div class='" + container.substr(1) + "'></div>");
            }

            $(container).append(banner);

            $(document).on("click", ".alert-remove", function() {
                lace.alert.hide($(this).parent($(".alert-bar")));
            });

            if (alert.timeout) {
                setTimeout(function() {
                    lace.alert.hide("#" + alert.id);
                }, alert.timeout);
            }
        },

        /**
         * Hide alert message(s).
         * @constructor
         * @param {String} [element]
         */
        hide: function(element) {
            var container = ".alert-container";

            if (!element) {
                element = ".alert-bar";
            }

            lace.animate.transition("fadeout", element, function() {
                $(element).remove();

                if ($(container).children().length === 0) {
                    $(container).remove();
                }
            });
        }
    },

    notify: {
        /**
         * Check desktop notifications support.
         * @constructor
         * @return {{ type: String, permission: String }}
         */
        support: function() {
            var type, permission;

            if ("webkitNotifications" in window) {
                type = "webkit";
                switch(webkitNotifications.checkPermission()) {
                    case "0":
                        permission = "granted";
                        break;
                    case "2":
                        permission = "denied";
                        break;
                    default:
                        permission = "default";
                        break;
                }
            } else if ("Notification" in window) {
                type = "html5";
                permission = Notification.permission;
            } else {
                return false;
            }

            return { "type" : type, "permission" : permission };
        },

        /**
         * Request permission for desktop notifications.
         * @constructor
         */
        request: function() {
            var check = lace.notify.support();

            if (check.permission !== "granted" && check.permission !== "denied") {
                if (check.type === "webkit") {
                    webkitNotifications.requestPermission();
                } else if (check.type === "html5") {
                    Notification.requestPermission();
                }
            }
        },

        /**
         * Show a desktop notification.
         * @constructor
         * @param {{ title: String, body: String, tag: String, icon: String, action: Function }} notification
         */
        show: function(notification) {
            var check = lace.notify.support(),
                n;

            if (check.permission === "granted") {
                if (check.type === "webkit") {
                    n = webkitNotifications.createNotification(notification.icon, notification.title, notification.body);
                    n.show();
                    n.onclick = notification.action;
                } else if (check.type === "html5") {
                    n = new Notification(notification.title, { dir: "auto", lang: "en-US", body: notification.body, tag: notification.tag, icon: notification.icon });
                    n.onclick = notification.action;
                }
            } else {
                lace.notify.request();
            }
        }
    }
};
