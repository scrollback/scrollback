/* jshint browser: true */
/* global $, libsb, currentState */

var currentConfig,
    renderSettings = require("./render-settings.js");

$(".configure-button").on("click", function () {
    libsb.emit('navigate', {
        mode: "conf",
        source: "configure-button",
        room: window.currentState.roomName
    });
});

$(".conf-save").on("click", function () {
    var self = $(this);
    if (currentState.mode == 'conf') {
        self.addClass("working");
        libsb.emit('config-save', {
            id: window.currentState.room,
            description: '',
            identities: [],
            params: {}
        }, function (err, room) {
            var roomObj = {
                to: currentState.room,
                room: room
            };

            libsb.emit('room-up', roomObj, function () {
                self.removeClass("working");
                if(err) {
                    // handle the error
                }else {
                    for(i in room.room.params) {
                        if(room.room.params[i].error) {
                            console.log("Error happed when saving the room");
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


function showConfig(room){
    var roomObj = {room: room};
    libsb.emit('config-show', roomObj, function(err, tabs) {
        var data = renderSettings(tabs);
        delete tabs.room;
        currentConfig = tabs;


        $('.meta-conf').empty().append(data[0]);
        $('.conf-area').empty().append(data[1]);
     });
}

libsb.on('navigate', function (state, next) {
    var isOwner = false,
        checkOwnerShip = function() {
            libsb.memberOf.forEach(function (room) {
                if (room.id == currentState.roomName && room.role == "owner") isOwner = true;
            });

            if (isOwner === false) {
                libsb.emit('navigate', {
                    mode: 'normal'
                });
            }
        };

    if (state.mode === "conf") {
        if (libsb.isInited) {
            checkOwnerShip();
        } else {
            libsb.on('inited', function (d, next) {
                checkOwnerShip();
                next();
            });
        }

        if (!currentConfig) {
            if (libsb.isInited) {
                showConfig(state.room);
            } else {
                libsb.on('inited', function (e, n) {
                    showConfig(state,room);
                    if (n) n();
                });
            }
        }
    }

    next();
});
