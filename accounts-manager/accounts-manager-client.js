/* jshint browser:true */
/* global $, libsb */

var loginWithGoogle = require('./google-am-client.js');
var loginWithFacebook = require('./facebook-am-client.js');

function attachSpinner(method) {
	var $spinnerEl = $('#spinner');
	$spinnerEl.addClass('spinner');
	libsb.on('init-dn', function(i, n) {
		$spinnerEl.removeClass('spinnner');
		return n();
	}, 500);
	return method;
}

$('.js-phonegap-google-login').click(attachSpinner(loginWithGoogle));
$('.js-phonegap-fb-login').click(attachSpinner(loginWithFacebook));