/* jshint browser: true */

module.exports = function() {
	var wf, s;

	window.WebFontConfig = {
		google: {
			families: [ "Open+Sans:400,700:latin" ]
		}
	};

	wf = document.createElement("script");

	wf.src = ("https:" === document.location.protocol ? "https" : "http") + "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
	wf.type = "text/javascript";
	wf.async = "true";

	s = document.getElementsByTagName("script")[0];

	s.parentNode.insertBefore(wf, s);
};
