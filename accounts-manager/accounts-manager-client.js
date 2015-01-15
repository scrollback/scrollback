/* jshint browser:true */
/* global $ */

var loginWithGoogle = require('./google-am-client.js');
var loginWithFacebook = require('./facebook-am-client.js');

$('.js-phonegap-google-login').click(loginWithGoogle);
$('.js-phonegap-fb-login').click(loginWithFacebook);