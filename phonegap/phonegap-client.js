/* jshint browser:true */
/* global libsb, $ */
window.handleOpenURL = function handleOpenURL(u) {
	function updateQueryStringParameter(uri, key, value) {
		var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
		var separator = uri.indexOf('?') !== -1 ? "&" : "?";
		if (uri.match(re)) {
			return uri.replace(re, '$1' + key + "=" + value + '$2');
		}
		else {
			return uri + separator + key + "=" + value;
		}
	}
	location.href = updateQueryStringParameter(u, "platform", "android");
};

var config = require('../client-config.js');
libsb.on("navigate", function(state, next) {
	
	var regex;
	if (state.phonegap && state.source === 'boot') {
		regex = new RegExp("(^https?:" + config.server.host + ")(($)|(\/)).*");
		window.openExternal = function openExternal(elem) {
			window.open(elem.href, "_system");
			return false;
		};
		$(document).on('click', "a[href]", function(e) {

			if (!(regex).test(this.href)) {
				e.preventDefault();
				window.openExternal(this);
			}

		});
	}
	next();
}, 500);

