/* jshint browser: true */
/* global $, libsb, currentState */

var currentConfig,
    renderSettings = require("./render-settings.js");

$(".configure-button").on("click", function () {
    libsb.emit('navigate', {
        mode: "conf",
        source: "configure-button",
        room: location.pathname.replace('/', '')
    });
});

$(".conf-save").on("click", function () {
    if (currentState.mode == 'conf') {
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
                currentConfig = null;

                $('.conf-area').empty();

                libsb.emit('navigate', {
                    mode: "normal",
                    tab: "info",
                    source: "conf-save"
                });
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

function getRooms() {
    libsb.getRooms({
        ref: currentState.room
    }, function (err, data) {
        var room = data.results[0],
            roomObj = { room: room };

        libsb.emit('config-show', roomObj, function (err, tabs) {
            delete tabs.room;

            currentConfig = tabs;

            var data = renderSettings(tabs);

            $('.meta-conf').empty().append(data[0]);
            $('.conf-area').empty().append(data[1]);
        });
    });
}

libsb.on('navigate', function (state, next) {
    var isOwner = false,
        checkOwnerShip = function() {
            libsb.memberOf.forEach(function (room) {
                if (room.id == currentState.room && room.role == "owner") isOwner = true;
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
                getRooms();
            } else {
                libsb.on('inited', function (e, n) {
                    getRooms();

                    if (n) n();
                });
            }
        }
    }

    next();
});
