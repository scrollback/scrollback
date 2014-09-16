/* jshint browser:true */
/* global currentState, fbRef, $ */

console.log("phonegap fb is called! ");
currentState.phonegap = false;
if (currentState.phonegap) {
	console.log("Phonegap FB called, condition is happy :)");
	setInterval(function () {
		fbRef.executeScript("var p = window.postedMessages; window.postedMessages = []; return p;", function (ret) {
			if (ret && ret.length > 0) {
				$(window).trigger('messsage', ret[0]);
				fbRef.close();
			}
		});
	}, 100);
}