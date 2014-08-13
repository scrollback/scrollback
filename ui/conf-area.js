/* jshint browser: true */
/* global $, libsb, currentState */

var currentConfig,
    renderSettings = require("./render-settings.js");

$(".configure-button").on("click", function () {
    libsb.emit('navigate', {
        mode: "conf",
        source: "configure-button",
        roomName: window.currentState.roomName,
    });
});

$(".conf-save").on("click", function () {
    var self = $(this);
    if (currentState.mode == 'conf') {
        self.addClass("working");
        self.attr("disabled", true);
        libsb.emit('config-save', {
            id: window.currentState.roomName,
            description: '',
            identities: [],
            params: {},
            guides: {}
        }, function (err, room) {
            var roomObj = {
                to: currentState.roomName,
                room: room
            };

            libsb.emit('room-up', roomObj, function (err, room) {
                self.removeClass("working");
                self.attr("disabled", false);
                if(err) {
                    // handle the error
                } else {
                    for(var i in room.room.params) {
                        if(!room.room.params.hasOwnProperty(i)) continue;
                        if(room.room.params[i].error) {
                            return;
                        }
                    }
                    currentConfig = null;
                    $('.conf-area').empty();
					
        			libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-save" });
                }
            });
        });
		
    }
});

$(".conf-cancel").on("click", function () {
    currentConfig = null;

    $('.conf-area').empty();

    libsb.emit('navigate', {
        mode: "normal",
        tab: "info",
        source: "conf-cancel"
    });
});


function showConfig(room) {
    var roomObj = {room: room};
    libsb.emit('config-show', roomObj, function(err, tabs) {
		delete tabs.room;
        currentConfig = tabs;
        renderSettings(tabs);
     });
}

libsb.on('navigate', function (state, next) {
    var isOwner = false;

    function cancelEdit() {
        libsb.emit('navigate', {
            mode: 'normal',
            source: "conf-cancel"
        });
    }

    function checkOwnerShip() {
        if(libsb.memberOf) {
            libsb.memberOf.forEach(function (room) {
                if (room.id == currentState.roomName && room.role == "owner") isOwner = true;
            });
        }

        return isOwner;
    }

    if (state.old && state.old.mode !== state.mode && state.mode === "conf") {
        if (!checkOwnerShip()) {
            cancelEdit();
            return next();
        }

        libsb.getRooms({ref: currentState.roomName, hasMember: libsb.user.id, cachedRoom: false}, function(err, data) {
            if(err || !data.results || !data.results.length) { // cachedRoom false will fetch the room from server directly.
                //may be even show error.
                cancelEdit();
                return next();
            }

            showConfig(data.results[0]);
        });
    }

    next();
}, 500);
