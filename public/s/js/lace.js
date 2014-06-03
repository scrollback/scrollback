/* jslint browser: true, indent: 4, regexp: true */
/* global $ */

/**
 * @fileOverview User interface components.
 * @author Satyajit Sahoo <satya@scrollback.io>
 * @requires jQuery, setCursorEnd
 */

var lace = {
    animate: {
        /**
         * Add a class to an element and execute an action after transition.
         * @constructor
         * @param {String} classname
         * @param {String} element
         * @param {Function} [action]
         */
        transition: function(classname, element, action) {
            if (!action) {
                action = function() {};
            }

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

    progress: {
        /**
         * Show a progress indicator.
         * @constructor
         */
        show: function() {
            if ($(".progress").length) {
                $(".progress").remove();
            }

            $("<div>").addClass("progress loading").appendTo("body");
        },

        /**
         * Set progress by percentage
         * @constructor
         * @param {Number} amount
         */
        set: function(amount) {
            $(".progress").removeClass("loading").css({ "width" : amount + "%" });
        },

        /**
         * Hide progress indicator.
         * @constructor
         */
        hide: function() {
            lace.progress.set(100);

            setTimeout(function() {
                $(".progress").remove();
            }, 500);
        }
    },

    multientry: {
        /**
         * Add event handlers for multientry.
         * @constructor
         */
        init: function() {
            if (lace.multientry.init.done) {
                return;
            }

            $(document).on("keydown", ".multientry .item", function(e) {
                if (e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 188) {
                    e.preventDefault();
                    lace.multientry.add($(this).parent(".multientry"), $(this).text());
                }
            });

            $(document).on("paste", ".multientry .item", function(e) {
                e.preventDefault();

                var items = e.originalEvent.clipboardData.getData('Text');

                lace.multientry.add($(this).parent(".multientry"), items);
            });

            $(document).on("keydown", ".multientry .item", function(e) {
                if (e.keyCode === 8 && $(this).text().match(/^\s*$/)) {
                    e.preventDefault();

                    $(this).text($(this).prev().find(".item-text").text());
                    $(this).prev().remove();

                    if ($.fn.setCursorEnd) {
                        $(this).setCursorEnd();
                    }
                }
            });

            $(document).on("click", ".multientry .item-remove", function() {
                lace.multientry.remove($(this).parent());
            });

            $(document).on("click", ".multientry", function() {
                $(this).children().last().focus();
            });

            lace.multientry.init.done = true;
        },

        /**
         * Create the markup required for multientry.
         * @constructor
         * @return {Object}
         */
        create: function() {
            lace.multientry.init();

            var multientry = $("<span>").addClass("entry multientry").append(
                $("<span>").addClass("item").attr({"contenteditable": true})
            );

            return multientry;
        },

        /**
         * Add items to multientry.
         * @constructor
         * @param {String} element
         * @param {String[]} content
         */
        add: function(element, content) {
            if (content) {
                if (!(content instanceof Array)) {
                    content = content.split(/[\s,]+/);
                }

                content.forEach(function(text) {
                    if (!text.match(/^\s*$/) ) {
                        $("<div>")
                        .addClass("item done")
                        .append($("<span>").addClass("item-text").text(text.trim()))
                        .append($("<span>").addClass("item-remove"))
                        .insertBefore(($(element).children().last()).empty());
                    }
                });
            }
        },

        /**
         * Remove an item from multientry.
         * @constructor
         * @param {String} [element]
         */
        remove: function(element) {
            if (!element) {
                element = $(".multientry .item.done");
            }

            if (!$(element).hasClass(".item")) {
                return;
            }

            $(element).remove();
        },

        /**
         * Get items from multientry.
         * @constructor
         * @param {String} [element]
         * @return {String[]}
         */
        items: function(element) {
            if (!element) {
                element = $(".multientry");
            }

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
         * Add event handlers for modal dialog.
         * @constructor
         */
        init: function() {
            if (lace.modal.init.done) {
                return;
            }

            $(document).on("keydown", function(e) {
                if (e.keyCode === 27 && lace.modal.dismiss) {
                    lace.modal.hide();
                }
            });

            $(document).on("click", ".backdrop", function() {
                if (lace.modal.dismiss) {
                    lace.modal.hide();
                }
            });

            $(document).on("click", ".modal-remove", lace.modal.hide);

            lace.modal.init.done = true;
        },

        /**
         * Show a modal dialog.
         * @constructor
         * @param {{ body: String, dismiss: Boolean, backdrop: Boolean }} modal
         */
        show: function(modal) {
            lace.modal.init();

            if (typeof modal.dismiss !== "boolean" || modal.dismiss) {
                lace.modal.dismiss = true;
            } else {
                lace.modal.dismiss = false;
            }

            if ($(".modal").length || $(".backdrop").length) {
                $(".modal, .backdrop").remove();
            }

            if (typeof modal.backdrop !== "boolean" || modal.backdrop) {
                $("<div>").addClass("backdrop").appendTo("body");
            }

            $("<div>").addClass("modal").html(modal.body).appendTo("body");

            $(".modal").css({
                "margin-top" : $(".modal").outerHeight() / -2,
                "margin-left" : $(".modal").outerWidth() / -2
            });
        },

        /**
         * Hide modal dialog.
         * @constructor
         */
        hide: function() {
            [".backdrop", ".modal"].forEach(function(el) {
                lace.animate.transition("fadeout", el, function() {
                    $(el).remove();
                });
            });
        }
    },

    popover: {
        /**
         * Add event handlers for popover.
         * @constructor
         */
        init: function() {
            if (lace.popover.init.done) {
                return;
            }

            $(document).on("click", ".popover-layer", lace.popover.hide);

            lace.popover.init.done = true;
        },

        /**
         * Show a popover.
         * @constructor
         * @param {{ body: String, origin: String }} popover
         */
        show: function(popover) {
            lace.popover.init();

            var spacetop = $(popover.origin).offset().top - $(document).scrollTop() + $(popover.origin).height(),
                spacebottom = $(window).height() - spacetop,
                spaceleft = $(popover.origin).offset().left - $(document).scrollLeft() + ( $(popover.origin).width() / 2 ),
                spaceright = $(window).width() - spaceleft;

            if ($(".popover-body").length || $(".popover-layer").length) {
                $(".popover-body, .popover-layer").remove();
            }

            $("<div>").addClass("popover-layer").appendTo("body");
            $("<div>").addClass("popover-body").html(popover.body).appendTo("body");

            if ($(".popover-body").outerWidth() >= spaceleft) {
                $(".popover-body").addClass("arrow-left");
                spaceleft = $(popover.origin).width() / 2;
            } else if ($(".popover-body").outerWidth() >= spaceright) {
                $(".popover-body").addClass("arrow-right");
                spaceleft = $(window).width() - ( $(popover.origin).width() / 2 ) - $(".popover-body").outerWidth();
            } else {
                spaceleft = spaceleft - ( $(".popover-body").outerWidth() / 2 );
            }

            if ($(popover.origin).height() >= $(window).height()) {
                $(".popover-body").addClass("popover-bottom");
                spacetop = $(window).height() / 2;
            } else if ($(".popover-body").outerHeight() >= spacebottom) {
                $(".popover-body").addClass("popover-top");
                spacetop = spacetop - $(popover.origin).height() - $(".popover-body").outerHeight();
            } else {
                $(".popover-body").addClass("popover-bottom");
            }

            $(".popover-body").css({
                "top" : spacetop,
                "left" : spaceleft
            });
        },

        /**
         * Hide popover.
         * @constructor
         */
        hide: function() {
            lace.animate.transition("fadeout", ".popover-body", function() {
                $(".popover-body, .popover-layer").remove();
            });
        }
    },

    alert: {
        /**
         * Add event handlers for alert message.
         * @constructor
         */
        init: function() {
            if (lace.alert.init.done) {
                return;
            }

            $(document).on("click", ".alert-remove", function() {
                lace.alert.hide($(this).parent($(".alert-bar")));
            });

            lace.alert.init.done = true;
        },

        /**
         * Show an alert message.
         * @constructor
         * @param {{ type: String, body: String, id: String, timeout: Number }} alert
         */
        show: function(alert) {
            lace.alert.init();

            if (!alert.type) {
                alert.type = "info";
            }

            if ((!alert.id) || $("#" + alert.id).length) {
                alert.id = "lace-alert-" + new Date().getTime();
            }

            if (!$(".alert-container").length) {
                $("<div>").addClass("alert-container").appendTo("body");
            }

            $("<div>")
            .addClass("alert-bar " + alert.type)
            .attr("id", alert.id)
            .append($("<span>").addClass("alert-content").html(alert.body))
            .append($("<span>").addClass("alert-remove"))
            .appendTo(".alert-container");

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
            if (!element) {
                element = $(".alert-bar");
            }

            if (!$(element).hasClass("alert-bar")) {
                return;
            }

            lace.animate.transition("fadeout", element, function() {
                $(element).remove();

                if (!$(".alert-container").children().length) {
                    $(".alert-container").remove();
                }
            });
        }
    },
};

window.lace = lace;
