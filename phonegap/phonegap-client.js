/* jshint browser:true */
/* global libsb, $ */
var config = require('../client-config.js');
libsb.on("navigate", function(state, next) {
	if (state.phonegap && state.source === 'boot') {
		window.openExternal = function openExternal(elem) {
			window.open(elem.href, "_system");
			return false;
		};
		$(document).on('click', "a[href]", function(e) {
			// config.host e.g- //local.scrollback.io
			if (!(new RegExp("(^https?:" + config.host + ")(($)|(\/)).*")).test(this.href)) {
				e.preventDefault();
				window.openExternal(this);
			}

		});
	}
	next();
}, 500);

