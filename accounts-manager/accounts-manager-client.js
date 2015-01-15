/* jshint browser:true */
/* global $ */

var loginWithGoogle = require('./google-am.js');
var loginWithFacebook = require('./facebook-am.js');

$('.js-phonegap-google-login').click(loginWithGoogle);
$('.js-phonegap-fb-login').click(loginWithFacebook);