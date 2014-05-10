/* jslint browser: true, indent: 4, regexp: true */
/* global $, Notification, webkitNotifications */

var lace = {
    animate: {
        fadeout: function(el, func) {
            if (typeof document.body.style.transition === 'string') {
                $(el).addClass("hidden").data("transitioning", true);

                $(el).on("transitionend webkitTransitionEnd msTransitionEnd oTransitionEnd", function (e) {
                    if (e.target === e.currentTarget && $(this).data("transitioning") === true) {
                        $(el).removeClass("hidden").data("transitioning", false);
                        func();
                    }
                });
            } else {
                func();
            }
        }
    },

    multientry: {
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

        add: function(el, text) {
            if (!text.match(/^\s*$/) ) {
                $("<div class='item done'><span class='item-text'>" + text + "</span><span class='item-remove close'>&times;</span></div>").insertBefore($(el).empty());
            }
        },

        remove: function(el) {
            if (!el) {
                el = ".multientry .item";
            }

            $(el).remove();
        },

        items: function(el) {
            var elems = $(el).find(".item-text"),
                items = new Array(elems.length);

            for (var i = 0; i < elems.length; i++) {
                items[i] = $(elems[i]).text();
            }

            return items;
        }
    },

    modal: {
        show: function(content) {
            var modal = $('<div class="modal">' + content + '</div>');

            $("body").append("<div class='dim'></div>").append(modal);

            modal.css({
                "margin-top" : modal.outerHeight() / -2,
                "margin-left" : modal.outerWidth() / -2
            });

            if (modal.find(".modal-remove").length === 0) {
                $(".dim").on("click", function() {
                    lace.modal.hide();
                });
            }

            $(".modal-remove").on("click", function() {
                lace.modal.hide();
            });
        },

        hide: function() {
            [".dim", ".modal"].forEach(function(el) {
                lace.animate.fadeout(el, function() {
                    $(el).remove();
                });
            });
        }
    },

    popover: {
        show: function(el, content) {
            var popover = $('<div role="menu" class="popover-body">' + content + '</div>'),
                spacetop = $(el).offset().top - $(document).scrollTop() + $(el).height(),
                spacebottom = $(window).height() - spacetop,
                spaceleft = $(el).offset().left - $(document).scrollLeft() + ( $(el).width() / 2 ),
                spaceright = $(window).width() - spaceleft;

            $("body").append("<div class='layer'></div>").append(popover);

            if (spaceleft <= popover.outerWidth()) {
                $(popover).addClass("arrow-left");
                spaceleft = $(el).width() / 2;
            } else if (spaceright <= popover.outerWidth()) {
                $(popover).addClass("arrow-right");
                spaceleft = $(window).width() - ( $(el).width() / 2 ) - popover.outerWidth();
            }

            if (spacebottom <= spacetop ) {
                $(popover).addClass("popover-top");
                spacetop = spacetop - ( $(el).height() * 2 ) - popover.outerHeight();
            } else {
                $(popover).addClass("popover-bottom");
            }

            popover.css({
                "top" : spacetop,
                "left" : spaceleft
            });

            $(".layer").on("click", function() {
                lace.popover.hide();
            });
        },

        hide: function() {
            lace.animate.fadeout(".popover-body", function() {
                $(".popover-body").remove();
                $(".layer").remove();
            });
        }
    },

    alert: {
        show: function(type, text) {
            var container = ".alert-container",
                alert = "<div class='alert-bar " + type + "'>" + text + "<a class='alert-remove close'>&times;</span></div>";

            if ($(container).length === 0) {
                $("body").append("<div class='" + container.substr(1) + "'></div>");
            }

            $(container).append(alert);

            $(document).on("click", ".alert-remove", function() {
                lace.alert.hide($(this).parent($(".alert-bar")));
            });
        },

        hide: function(el) {
            var container = ".alert-container";

            if (!el) {
                el = ".alert-bar";
            }

            lace.animate.fadeout(el, function() {
                $(el).remove();

                if ($(container).children().length === 0) {
                    $(container).remove();
                }
            });
        }
    },

    notify: {
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
                }
            } else if ("Notification" in window) {
                type = "html5";
                permission = Notification.permission;
            } else {
                return false;
            }

            return { "type" : type, "permission" : permission };
        },

        request: function() {
            var check = lace.notify.support();

            if (check.permission !== "granted" && check.permission !== "denied") {
                if (check.type === "webkit") {
                    webkitNotifications.requestPermission();
                } else if (check.type === "html5") {
                    Notification.requestPermission();
                }
            } else {
                return false;
            }
        },

        show: function(title, body, icon, id, func) {
            var check = lace.notify.support(),
                notification;

            if (check.permission === "granted") {
                if (check.type === "webkit") {
                    notification = webkitNotifications.createNotification(icon, title, body);
                    notification.show();
                    notification.onclick = func;
                } else if (check.type === "html5") {
                    notification = new Notification(title, { dir: "auto", lang: "en-US", body: body, tag: id, icon: icon });
                    notification.onclick = func;
                }
            } else {
                lace.notify.request();
            }
        }
    }
};
