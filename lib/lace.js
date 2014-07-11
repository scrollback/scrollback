/* jslint browser: true, indent: 4, regexp: true */
/* global $ */

/**
 * @fileOverview User interface components.
 * @author Satyajit Sahoo <satya@scrollback.io>
 * @requires jQuery, Velocity, setCursorEnd
 */

var lace = {
    events: {
        /**
         * Add css to an element and execute an action after an event.
         * @constructor
         * @param {{ element: String, event: String, css: String, action: Function, support: Boolean }} options
         */
        core: function(options) {
            var $element = $(options.element);

            if (typeof options.action !== "function") {
                options.action = function() {};
            }

            if (options.support && $element.is(":visible") && document.hasFocus()) {
                var onanimate = function() {
                    if ($element.data("lace.animate")) {
                        for (var property in options.css) {
                            $element.css(property, "");
                        }

                        $element.data("lace.animate", false);
                        options.action.call($element);

                        // Remove event handlers
                        $element.off(options.event);
                        $(window).off("blur.lace.animate");
                    }
                };

                $element.on(options.event, function(e) {
                    if (e.target === e.currentTarget) {
                        onanimate();
                    }
                }).css({ transition: ".15s ease" }).css(options.css).data("lace.animate", true);

                // Fix event not firing when window not focused
                $(window).on("blur.lace.animate", function() {
                    onanimate();
                });
            } else {
                options.action.call($element);
            }
        },

        /**
         * Add css to an element and execute an action after animation.
         * @constructor
         * @param {Object} css
         * @param {String} element
         * @param {Function} [action]
         */
        animationend: function(css, element, action) {
            var event = "animationend webkitAnimationEnd mozAnimationEnd MSAnimationEnd oAnimationEnd",
                support = typeof document.body.style.animation === "string" ||
                typeof document.body.style.WebkitAnimation === "string" ||
                typeof document.body.style.MozAnimation === "string" ||
                typeof document.body.style.MsAnimation === "string" ||
                typeof document.body.style.OAnimation === "string";

            lace.events.core({
                css: css,
                element: element,
                action: action,
                event: event,
                support: support
            });
        },

        /**
         * Add css to an element and execute an action after transition.
         * @constructor
         * @param {Object} css
         * @param {String} element
         * @param {Function} [action]
         */
        transitionend: function(css, element, action) {
            var event = "transitionend webkitTransitionEnd mozTransitionEnd msTransitionEnd oTransitionEnd",
                support = typeof document.body.style.transition === "string" ||
                typeof document.body.style.WebkitTransition === "string" ||
                typeof document.body.style.MozTransition === "string" ||
                typeof document.body.style.MsTransition === "string" ||
                typeof document.body.style.OTransition === "string";

            lace.events.core({
                css: css,
                element: element,
                action: action,
                event: event,
                support: support
            });
        }
    },

    animate: {
        /**
         * Fade out an element and execute an action after removal.
         * @constructor
         * @param {String} element
         * @param {Function} [action]
         */
        fadeout: function(element, action) {
            if (typeof action !== "function") {
                action = function() {};
            }

            if ($.fn.velocity) {
                $(element).velocity("fadeOut", 150, action);
            } else {
                lace.events.transitionend({ opacity: 0 }, element, action);
            }
        }
    },

    progress: {
        /**
         * Show a progress indicator.
         * @constructor
         */
        show: function() {
            var $progress = $(".progress");

            if ($progress.length) {
                $progress.remove();
            }

            $progress = $("<div>").addClass("progress loading");
            $progress.appendTo("body");

            return $progress;
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

            $(document).on("blur", ".multientry", function() {
                lace.multientry.add($(this), $(this).children().last().text());
            });

            $(document).on("keydown", ".multientry .item", function(e) {
                if (e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 188) {
                    e.preventDefault();
                    lace.multientry.add($(this).parent(".multientry"), $(this).text());
                }
            });

            $(document).on("paste", ".multientry .item", function(e) {
                e.preventDefault();

                var items = e.originalEvent.clipboardData.getData("Text");

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

            var $multientry = $("<span>").addClass("multientry").append(
                $("<span>").addClass("item").attr({"contenteditable": true})
            );

            return $multientry;
        },

        /**
         * Add items to multientry.
         * @constructor
         * @param {String} element
         * @param {String[]} content
         */
        add: function(element, content) {
            var $element = $(element);

            if (content) {
                if (!(content instanceof Array)) {
                    content = content.split(/[\s,]+/);
                }

                content.forEach(function(text) {
                    if (!text.match(/^\s*$/) ) {
                        $("<span>")
                        .addClass("item done")
                        .append($("<span>").addClass("item-text").text(text.trim()))
                        .append($("<span>").addClass("item-remove"))
                        .insertBefore(($element.children().last()).empty());
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
            var $element;

            if (element) {
                $element = $(element);
            } else {
                $element = $(".multientry .item.done");
            }

            if (!$element.hasClass("item")) {
                return;
            }

            lace.animate.fadeout($element, function() {
                $(this).remove();
            });
        },

        /**
         * Get items from multientry.
         * @constructor
         * @param {String} [element]
         * @return {String[]}
         */
        items: function(element) {
            var $element;

            if (element) {
                $element = $(element);
            } else {
                $element = $(".multientry");
            }

            var elems = $element.find(".item-text"),
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
        show: function(options) {
            lace.modal.init();

            var $modal = $(".modal"),
                $backdrop = $(".backdrop");

            if (typeof options.dismiss !== "boolean" || options.dismiss) {
                lace.modal.dismiss = true;
            } else {
                lace.modal.dismiss = false;
            }

            if (typeof options.backdrop !== "boolean" || options.backdrop) {
                if (!$backdrop.length) {
                    $backdrop = $("<div>").addClass("backdrop");
                    $backdrop.appendTo("body");
                }
            } else if ($backdrop.length) {
                $backdrop.remove();
            }

            if ($modal.length) {
                $modal.empty().html(options.body);
            } else {
                $modal = $("<div>").addClass("modal").html(options.body);
                $modal.appendTo("body");
            }

            $modal.css({
                "margin-top" : $modal.outerHeight() / -2,
                "margin-left" : $modal.outerWidth() / -2
            });

            return $modal;
        },

        /**
         * Hide modal dialog.
         * @constructor
         */
        hide: function() {
            [".backdrop", ".modal"].forEach(function(el) {
                lace.animate.fadeout(el, function() {
                    $(this).remove();
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
         * @param {{ body: String, origin: String, heading: String, menu: Object }} popover
         */
        show: function(options) {
            lace.popover.init();

            var $popover = $(".popover-body"),
                $layer = $(".popover-layer"),
                $origin = $(options.origin),
                spacetop = $origin.offset().top - $(document).scrollTop() + $origin.height(),
                spacebottom = $(window).height() - spacetop,
                spaceleft = $origin.offset().left - $(document).scrollLeft() + ( $origin.width() / 2 ),
                spaceright = $(window).width() - spaceleft;

            if (!$layer.length) {
                $layer = $("<div>").addClass("popover-layer");
                $layer.appendTo("body");
            }

            if ($popover.length) {
                $popover.remove();
            }

            $popover = $("<div>").addClass("popover-body").html(options.body);
            $popover.appendTo("body");

            if ($popover.outerWidth() >= spaceleft) {
                $popover.addClass("arrow-left");
                spaceleft = $origin.width() / 2;
            } else if ($popover.outerWidth() >= spaceright) {
                $popover.addClass("arrow-right");
                spaceleft = $(window).width() - ( $origin.width() / 2 ) - $popover.outerWidth();
            } else {
                spaceleft = spaceleft - ( $popover.outerWidth() / 2 );
            }

            if ($origin.height() >= $(window).height()) {
                $popover.addClass("popover-bottom");
                spacetop = $(window).height() / 2;
            } else if ($popover.outerHeight() >= spacebottom) {
                $popover.addClass("popover-top");
                spacetop = spacetop - $origin.height() - $popover.outerHeight();
            } else {
                $popover.addClass("popover-bottom");
            }

            $popover.css({
                "top" : spacetop,
                "left" : spaceleft
            });

            return $popover;
        },

        /**
         * Hide popover.
         * @constructor
         */
        hide: function() {
            lace.animate.fadeout(".popover-body", function() {
                $(this).remove();
                $(".popover-layer").remove();
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
        show: function(options) {
            lace.alert.init();

            if (!options.type) {
                options.type = "info";
            }

            if ((!options.id)) {
                options.id = "lace-alert-" + new Date().getTime();
            }

            var $alert = $("#" + options.id),
                $container = $(".alert-container");

            if (!$container.length) {
                $container = $("<div>").addClass("alert-container");
                $container.appendTo("body");
            }

            if ($alert.length && $alert.hasClass("alert-bar")) {
                $alert.removeClass().addClass("alert-bar " + options.type)
                .find(".alert-content").empty().html(options.body);
            } else {
                $alert = $("<div>")
                         .addClass("alert-bar " + options.type)
                         .attr("id", options.id)
                         .append($("<span>").addClass("alert-content").html(options.body))
                         .append($("<span>").addClass("alert-remove"));
                $alert.appendTo($container);
            }

            if (options.timeout) {
                setTimeout(function() {
                    lace.alert.hide($alert);
                }, options.timeout);
            }

            return $alert;
        },

        /**
         * Hide alert message(s).
         * @constructor
         * @param {String} [element]
         */
        hide: function(element) {
            var $element,
                $container = $(".alert-container");

            if (element) {
                $element = $(element);
            } else {
                $element = $(".alert-bar");
            }

            if (!$element.hasClass("alert-bar")) {
                return;
            }

            lace.animate.fadeout($element, function() {
                $(this).remove();

                if (!$container.children().length) {
                    $container.remove();
                }
            });
        }
    },
};

module.exports = lace;
