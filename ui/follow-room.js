/* jshint browser: true */
/* global $, libsb */

$(function() {
    var $body = $("body"),
        $button = $(".follow-button"),
        $action = $(".follow-room-action");

    function setFollow(value) {
        if (value) {
            $body.addClass("role-follower");
            $button.attr("data-tooltip", "Unfollow " + window.currentState.roomName);
        } else {
            $body.removeClass("role-follower");
            $button.attr("data-tooltip", "Follow " + window.currentState.roomName);
        }
    }

    function getFollow(x, n) {
        libsb.emit("getUsers", { memberOf: window.currentState.roomName, ref: libsb.user.id }, function(err, data){
            var user = data.results[0];

            if (user && (user.role === "follower" || user.role === "member")) {
                setFollow(true);
            } else {
                setFollow(false);
            }
        });

        if(n) return n();
    }

    $action.on("click", function() {
        if ($body.hasClass("role-follower")) {
            libsb.part(window.currentState.roomName);
        } else {
            libsb.join(window.currentState.roomName);
        }

        $body.toggleClass("role-follower");
    });

    libsb.on("navigate", function(state, next){
        if(state.roomName && state.room === null){ return next();}

        if(state.mode === "normal" && state.roomName !== state.old.roomName){
            if (libsb.isInited) {
                getFollow();
            } else {
                libsb.on("inited", getFollow, 100);
            }
        }

        next();
    }, 600);

    libsb.on("join-dn", function(state, next) {
        if (state.type === "join" && state.to === window.currentState.roomName && state.from === libsb.user.id) {
            setFollow(true);
        }

        next();
    }, 100);

    libsb.on("part-dn", function(state, next) {
        if (state.type === "part" && state.to === window.currentState.roomName && state.from === libsb.user.id) {
            setFollow(false);
        }

        next();
    }, 100);

    libsb.on("init-dn", function(state, next) {
        if (libsb.isInited) {
            getFollow();
        } else {
            libsb.on("inited", getFollow, 100);
        }

        next();
    }, 100);

    libsb.on("back-dn", function(state, next){
        if (libsb.isInited) {
            getFollow();
        } else {
            libsb.on("inited", getFollow, 100);
        }

        next();
    }, 100);
});
