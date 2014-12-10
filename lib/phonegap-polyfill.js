/* jshint browser:true */
/* global $ */

var ref;
var phonegapWin;

function listenPostMessage() {
    $(window).on('storage', function() {
        console.log("heard storage event!");
        if (localStorage.hasOwnProperty('postedMessage')) {
            var postedMessage = JSON.parse(localStorage.postedMessage);
            delete localStorage.postedMessage;
            console.log("triggering event");
            $.event.trigger({
                type: "message",
                originalEvent: {
                    data: postedMessage,
                    origin: window.location.href
                }
            });
            ref.close();
        }
    });
}

function openWindow(url) {
    setTimeout(function () {
        console.log("Polyfilled window.open is called");
        ref = phonegapWin(url, "_blank", "location=no");
        console.log("REF is ", ref);
        ref.addEventListener('loadstop', function() {
            console.log("Loadstop is fired, running exec script");
            ref.executeScript({code: " console.log('Reading from window.postedMessages', window.postedMessages); localStorage.postedMessage = JSON.stringify(window.postedMessage[0]); window.postedMessage.slice(0); "});
        });
    }, 10);
}

if (window.phonegap || window.cordova) {
    console.log("Corodova decteded!");
    listenPostMessage();
    document.addEventListener('deviceready', function() {
        console.log('got device ready');
        phonegapWin = window.open;
        setTimeout(function() {
            console.log("redefining window.open");
            window.open = openWindow;
        }, 100);
    }, false);
}
