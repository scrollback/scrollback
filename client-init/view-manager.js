/* jshint browser: true */
/* global $, libsb */
/* exported currentState */

var currentState = window.currentState;

// On navigation, set the body classes.
function addBodyClass(state, next) {
    if (state.old && state.theme !== state.old.theme) {
        if (state.theme) {
            if(state.old.theme) $("body").removeClass("theme-" + state.old.theme);
            $("body").addClass("theme-" + state.theme);
        }
    }

    if (state.old && state.embed !== state.old.embed) {
        if (state.old.embed && state.old.embed.form) {
            $("body").removeClass("embed-" + state.old.embed.form);
        }

        if (state.embed) {
            $("body").addClass("embed");

            if (state.embed.form) {
                $("body").addClass("embed-" + state.embed.form);
            }
        } else {
            $("body").removeClass("embed");
        }
    }

    if (state.old && state.minimize !== state.old.minimize) {
        if (state.embed && state.embed.form === "toast" && state.minimize) {
            $("body").addClass("minimized");
        } else {
            $("body").removeClass("minimized");
        }
    }

    if (state.old && state.mode !== state.old.mode) {
        $("body").removeClass("mode-" + state.old.mode);

        if (state.mode) {
            $("body").addClass("mode-" + state.mode);
        }
    }

    if (state.old && state.view !== state.old.view) {
        $("body").removeClass("view-" + state.old.view);

        if (state.view) {
            $("body").addClass("view-" + state.view);
        }
    }

    if (state.old && state.tab !== state.old.tab) {
        if (state.tab) {
            $(".tab.current").removeClass("current");
            $(".tab-" + state.tab).addClass("current");
        }
    }

    next();
}

module.exports = function () {
    libsb.on("navigate", addBodyClass, 500); // earlier it was 999.
};