/* jshint browser:true */
/* global libsb, $ */
var config = require('../client-config.js');
libsb.on("navigate", function(state, next) {
	if (state.phonegap && state.source === 'boot') {
		window.openExternal = function openExternal(elem) {
			window.open(elem.href, "_system");
			return false; // Prevent execution of the default onClick handler 
		};
		$(document).on('click', "a[href]", function() {
			// config.host e.g- //local.scrollback.io
			if (!(new RegExp("(^https?:" + config.host + ")(($)|(\/)).*")).test(this.href)) {
				window.openExternal(this);
			}
		});
	}
	next();
}, 500);

