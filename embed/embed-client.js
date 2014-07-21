/* jshint browser: true */
/* global $*/
var parseURL = require("../lib/parseURL.js");

/*  status flags.*/
var verificationStatus = false,
    bootingDone = false,
    verified = false;

/*  lasting objects*/
var embed, token, domain, path, preBootQueue = [],
    queue = [],
    parentHost;

function sendDomainChallenge() {
    token = Math.random() * Math.random();
    parentHost = embed.origin.protocol + "//" + embed.origin.host;
    window.parent.postMessage(JSON.stringify({
        type: "domain-challenge",
        token: token
    }), parentHost);
}

function verifyDomainResponse(data) {
    domain = embed.origin.host;
    path = embed.origin.path;

    if (data.token == token) {
        verified = true;
    } else {
        verified = false;
    }
    verificationStatus = true;
    while (preBootQueue.length) {
        (preBootQueue.shift())();
    }
}

function parseResponse(data) {
    try {
        data = JSON.parse(data);
    } catch (e) {
        data = {};
    }
    return data;
}

module.exports = function (libsb) {
    $(function () {
        // Handle fullview button click
        $(".embed-action-fullview").on("click", function () {
            window.open((window.location.href).replace(/[&,?]embed=[^&,?]+/g, ""), "_blank");
        });

        // Handle minimize
        $(".embed-action-minimize").on("click", function () {
            libsb.emit("navigate", {
                minimize: true
            });
        });

        $(".title-bar").on("click", function (e) {
            if (e.target === e.currentTarget) {
                libsb.emit("navigate", {
                    minimize: true
                });
            }
        });

        $(".minimize-bar").on("click", function () {
            libsb.emit("navigate", {
                minimize: false
            });
        });
    });

    var url = parseURL(window.location.pathname, window.location.search);
    embed = url.embed;

    if (embed && window.parent !== window) {
        embed = JSON.parse(decodeURIComponent(url.embed));
        window.onmessage = function (e) {
            var data = e.data;
            data = parseResponse(data);
            if (data.type == "domain-response") {
                verifyDomainResponse(data);
            }
        };
        sendDomainChallenge(embed.origin);
    } else {
        domain = location.hostname;
        path = location.path;
        verified = true;
        verificationStatus = true;
    }
    //    if (window.parent !== window) {
    libsb.on("navigate", function (state, next) {
        function processNavigate() {
            var guides;
            if (state.source == "boot") bootingDone = true;

            if (typeof state.room === "object") {
                guides = state.room.guides;
                if (!state.old || !state.old.roomName || state.roomName != state.old.roomName) {
                    if (guides && guides.http && guides.http.allowedDomains && guides.http.allowedDomains.length) {
                        if (!verified || guides.http.allowedDomains.indexOf(domain) == -1) state.room = 'embed-disallowed';
                    }
                }
            }

            if (window.parent !== window && state.old && state.embed && state.embed.form === "toast" && state.minimize !== state.old.minimize) {
                if (state.minimize) {
                    window.parent.postMessage("minimize", parentHost);
                } else {
                    window.parent.postMessage("maximize", parentHost);
                }
            }
            next();
        }

        if (state.source !== "boot") {
            if (!libsb.hasBooted) return next(new Error("BOOT_NOT_COMPLETE"));
            else processNavigate();
        } else {
            if (verificationStatus) {
                processNavigate();
            } else {
                queue.push(function () {
                    processNavigate();
                });
            }
        }
    }, 500);


    libsb.on("init-up", function (init, next) {
        function processInit() {
            init.origin = {
                domain: domain,
                path: path,
                verified: verified
            };
            next();
        }
        if (verificationStatus) processInit();
        else queue.push(processInit);
    }, 500);
};