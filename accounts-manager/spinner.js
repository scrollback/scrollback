/* global libsb, $ */

var $spinnerEl = $('#spinner');

$spinnerEl.addClass('spinner');

libsb.on('init-dn', function(i, n) {
	$spinnerEl.removeClass('spinnner');
	return n();
}, 500);