/* jshint browser:true */
/* global libsb, $ */
var config = require('../client-config-defaults.js');
libsb.on("navigate", function(state, next) {

	var regex;

	if (state.cordova && state.source === 'boot') {
		regex = new RegExp("\/\/" + config.server.host + ")(($)|(\/)).*");

		window.openExternal = function openExternal(elem) {
			window.open(elem.href, "_system", "location=yes");
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

$(document).on("click", ".js-reload-page", function() {
	window.location.reload();
});
