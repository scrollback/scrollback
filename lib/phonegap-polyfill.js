/* jshint node:true, browser:true, multistr:true */
/* global $ */

var ref;

console.log("called phonegap-polyfill");

function listenPostMessage() {
    $(window).on('storage', function () {
        console.log("Storage event happened");
        if (localStorage.hasOwnProperty('postedMessage')) {
            var postedMessage = JSON.parse(localStorage.postedMessage);
            console.log("Got postedMessage", postedMessage);
            $.event.trigger({
                type: "message",
                originalEvent: {
                    data: postedMessage,
                    origin: window.location.href
                }
            });
            delete localStorage.postedMessage;
            ref.close();
        }
    });
}

function openWindow(url) {
    console.log("openWindow called");
    ref = window.open(url, "_blank", "location=no");
    ref.addEventListener('loadstop', function () {
        console.log("Calling executeScript");
        ref.executeScript({
            code: "window.postMessage = window.opener.postMessage = function(d) {localStorage.postedMessage = JSON.stringify(d)}; console.log('Exectue script ran successfully! postMessage', window.postMessage); "
        });
    });
}

if (window.phonegap || window.cordova) {
    console.log("Inside polyfill, cordova detected!");
    listenPostMessage();
    // window.postMessage = postMsg;
    // window.opener.postMessage = postMsg;
    console.log("Postfilling window.open");
    window.open = openWindow;
}
