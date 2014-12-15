/* jshint browser:true */

console.log("Called post message polyfill");

var postMsg = function(msg) {
	console.log("window.postMessage polyfill invoked!");
	window.postedMessages = [];
	window.postedMessages.push(msg);
};

if(!window.opener) {
	window.opener = {};
	console.log("redefining window.opener.postMessage");
	window.opener.postMessage = postMsg;
}
