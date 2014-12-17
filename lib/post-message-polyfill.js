/* jshint browser:true */

console.log("Called post message polyfill");

var postMsg = function(msg) {
	console.log("window.postMessage polyfill invoked!");
	localStorage.postedMessage = JSON.stringify(msg);
//	window.postedMessages = [];
//	window.postedMessages.push(msg);
};

if(!window.opener) {
	window.opener = {};
	console.log("redefining window.opener.postMessage");
	window.opener.postMessage = window.parent.postMessage = postMsg;
//	setInterval(function() {
//		console.log("..", window.postedMessages.length);
//		if (window.postedMessages.length) {
//			console.log("Posted Message is not empty");
//			localStorage.postedMessage = JSON.stringify(window.postedMessages[0]);
//		}
//	}, 2000);
}
