/* jshint browser:true */
/* global $ */

var loginWithGoogle = require('./google-am.js');
var loginWithFacebook = require('./facebook-am.js');

$('.google-plus').click(loginWithGoogle);
$('.facebook-login').click(loginWithFacebook);