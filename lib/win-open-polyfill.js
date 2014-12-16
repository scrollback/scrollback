/* jshint browser:true */
/* global $ */

var ref;
var phonegapWin;

function listenPostMessage() {
	$(window).on('storage', function() {
		if (localStorage.hasOwnProperty('postedMessage')) {
			var postedMessage = JSON.parse(localStorage.postedMessage);
			delete localStorage.postedMessage;
			$.event.trigger({
				type: "message",
				originalEvent: {
					data: postedMessage,
					origin: window.location.protocol + "//" + window.location.host
				}
			});
			ref.close();
		}
	});
}

function openWindow(url, name, specs, replace) {
	name = name || "_blank";
	specs = specs || "location=no";
	setTimeout(function() {
		ref = phonegapWin(url, name, specs, replace);
		ref.addEventListener('loadstop', function() {
			ref.executeScript({
				code: "localStorage.postedMessage = JSON.stringify(window.postedMessages[0]); window.postedMessage.splice(0);"
			});
		});
	}, 100);
}

if (window.phonegap || window.cordova) {
	listenPostMessage();
	document.addEventListener('deviceready', function() {
		phonegapWin = window.open;
		setTimeout(function() {
			window.open = openWindow;
		}, 100);
	}, false);
}