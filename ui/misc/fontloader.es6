/* jshint esnext: true, browser: true */

"use strict";

module.exports = () => {
	window.WebFontConfig = {
		google: {
			families: [ "Open+Sans:400,700:latin" ]
		}
	};

	let wf = document.createElement("script");

	wf.src = ("https:" === document.location.protocol ? "https" : "http") + "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
	wf.type = "text/javascript";
	wf.async = "true";

	let s = document.getElementsByTagName("script")[0];

	s.parentNode.insertBefore(wf, s);
};
