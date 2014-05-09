/*jslint browser: true, indent: 4, regexp: true*/
/*global $, Notification, webkitNotifications*/

var ui = {
    popover: {
        show: function(el, content) {
            var popover = $('<div role="menu" class="popover-body">' + content + '</div>'),
                spacetop = $(el).offset().top - $(document).scrollTop() + $(el).height(),
                spacebottom = $(window).height() - spacetop + $(el).height(),
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

            if (spacebottom <= ( popover.outerHeight() * 2 ) ) {
                $(popover).addClass("popover-top");
                spacetop = spacetop - $(el).height() - ( popover.outerHeight() * 2 );
            } else {
                $(popover).addClass("popover-bottom");
            }

            popover.css({"top" : spacetop, "left" : spaceleft});

            $(".layer").on("click", function() {
                ui.popover.hide();
            });
        },

        hide: function() {
            $(".popover-body").remove();
            $(".layer").remove();
        }
    },

    alert: {
        show: function(type, text) {
            var $alert = $("<div class='alert-bar " + type + "'>" + text + "<a class='alert-remove close'>&times;</span></div>");
            $("body").append($alert);
            $(document).on("click", ".alert-remove", function() {
                ui.alert.hide();
            });
        },

        hide: function() {
            $(".alert-bar").remove();
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
            var check = ui.notify.support();

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
            var check = ui.notify.support(),
                notification;

            body = body.substr(0, 70);

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
                ui.notify.request();
            }
        }
    }
};
