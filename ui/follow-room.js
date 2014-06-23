/* jshint browser: true */
/* global $, libsb */

$(function() {
    var $button = $(".follow-button"),
        $action = $(".follow-room-action");

    function getFollow(x,n) {
        libsb.emit("getUsers", { memberOf: window.currentState.roomName, ref: libsb.user.id }, function(err, data){
            var user = data.results[0];
            if (user && (user.role === "follower" || user.role === "member")) {
                $("body").addClass("role-follower");
                $button.attr("data-tooltip", "Unfollow " + window.currentState.roomName);
            } else {
                $("body").removeClass("role-follower");
                $button.attr("data-tooltip", "Follow " + window.currentState.roomName);
            }
        });

        if(n) return n();
    }

    $action.on("click", function() {
        if ($("body").hasClass("role-follower")) {
            libsb.part(window.currentState.roomName);
        } else {
            libsb.join(window.currentState.roomName);
        }

        $("body").toggleClass("role-follower");

        getFollow();
    });

    libsb.on("navigate", function(state, next){
        if(state.roomName !== "pending" && state.room === null){ return next();}
        
        if(state.mode === "normal" && state.roomName !== state.old.roomName){
            if (libsb.isInited) {
                getFollow();
            } else {
                libsb.on("inited", getFollow);
            }
        }

        next();
    }, 600);

    libsb.on("init-dn", function(state, next){
        if (libsb.isInited) {
            getFollow();
        } else {
            libsb.on("inited", getFollow);
        }

        next();
    });

    libsb.on("back-dn", function(state, next){
        if (libsb.isInited) {
            getFollow();
        } else {
            libsb.on("inited", getFollow);
        }

        next();
    });
});
