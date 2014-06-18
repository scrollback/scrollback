/* jshint browser: true */
/* global $, libsb, currentState, desktopnotify, lace */

var currentConfig,
    renderSettings = require("./render-settings.js");

$(".conf-save").on("click", function () {
    if (currentState.mode == 'pref') {
        var userObj = {
            id: libsb.user.id,
            description: '',
            identities: [],
            params: {}
        };

        libsb.emit('pref-save', userObj, function (err, user) {
            libsb.emit('user-up', {
                user: user
            }, function () {
                currentConfig = null;

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

    $('.pref-area').empty();

    libsb.emit('navigate', {
        mode: "normal",
        tab: "info",
        source: "conf-cancel"
    });
});

function getUsers() {
    libsb.emit('getUsers', {
        ref: libsb.user.id
    }, function (err, data) {
        var user = data.results[0];

        if (!user.params) user.params = {};

        var userObj = {
            user: user
        };

        libsb.emit('pref-show', userObj, function (err, tabs) {
            delete tabs.user;

            currentConfig = tabs;

            var data = renderSettings(tabs);

            $('.meta-pref').empty().append(data[0]);
            $('.pref-area').empty().append(data[1]);

            // TODO: move to notification-client
            $("#desktop-notification").change(function() {
                if ($(this).is(":checked")) {
                    desktopnotify.request();
                }

                if (desktopnotify.support().permission === "denied") {
                    $(this).attr("checked", false);

                    lace.alert.show({
                        type: "error",
                        body: "Permission for desktop notifications denied!",
                        id: "desktopnotify-error-perm-denied"
                    });
                }
            });
        });
    });
}

libsb.on('navigate', function (state, next) {
    if (state.mode === "pref") {
        if (!currentConfig) {
            if (libsb.isInited) {
                if (libsb.user.id.indexOf('guest-') === 0) {
                    libsb.emit('navigate', {
                        mode: 'normal'
                    });
                }

                getUsers();
            } else {
                libsb.on('inited', function (a, next) {
                    getUsers();
                    next();
                });
            }
        }
    }

    next();
});
