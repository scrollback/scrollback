/* jshint browser: true */
/* global $, libsb */

$(function() {
    var $button = $(".follow-button");

    function getFollow(x,n) {
        libsb.emit("getUsers", { memberOf: window.currentState.room, ref: libsb.user.id }, function(err, data){
            var user = data.results[0];

            if (user && (user.role === "owner" || user.role === "follower")) {
                $("body").addClass("role-follower");
                $button.attr("data-tooltip", "Unfollow " + window.currentState.room);
            } else {
                $("body").removeClass("role-follower");
                $button.attr("data-tooltip", "Follow " + window.currentState.room);
            }
        });
        n && n();
    }

    $button.on("click", function() {
        if ($("body").hasClass("role-follower")) {
            libsb.part(window.currentState.room);
        } else {
            libsb.join(window.currentState.room);
        }

        $("body").toggleClass("role-follower");

        getFollow();
    });

    libsb.on("navigate", function(state, next){
        if(state.mode === "normal" && state.room !== state.old.room){
            if (libsb.isInited) {
                getFollow();
            } else {
                libsb.on("inited", getFollow);
            }
        }

        next();
    });

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
