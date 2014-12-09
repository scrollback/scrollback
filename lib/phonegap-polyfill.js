/* jshint node:true, browser:true, multistr:true */
/* global $ */

var ref;

console.log("called phonegap-polyfill");

var winOpen;

function listenPostMessage() {
	$(window).on('storage', function() {
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
	ref = winOpen(url, "_blank", "location=no");
    ref.executeScript({code: "console.log('BLAH BLAH BLAH');"});
//	ref.addEventListener('loadstop', function() {
//		console.log("Calling executeScript");
//		ref.executeScript({
//			code: "window.opener = {}; window.postMessage = window.opener.postMessage = function(d) {localStorage.postedMessage = JSON.stringify(d)}; console.log('Exectue script ran successfully! postMessage'); "
//		});
//	});
}

if (window.phonegap || window.cordova) {
	console.log("Inside polyfill, cordova detected!");
	listenPostMessage();
	// window.postMessage = postMsg;
	// window.opener.postMessage = postMsg;
	console.log("Postfilling window.open");
	document.addEventListener('deviceready', function() {
        winOpen = window.open();
		console.log("Got device ready, redefining window.open");
		setTimeout(function() {
			window.open = openWindow;

		}, 0);
	}, false);
}