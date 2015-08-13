"use strict";
/* global window*/
exports.uid = function (n) {
	var a, i, s, crypto = window.crypto || window.msCrypto;
	
	n = (typeof n === 'undefined') ? 32 : n;
	
	if (crypto) {
		a = crypto.getRandomValues(new Uint8Array(Math.ceil(n/2)));
		for(i = 0; i < a.length; i++) s += a[i].toString(16);
	} else {
		for(i = 0; i < Math.ceil(n/4); i++) s += ((Math.random() * 256 * 256) | 0).toString(16);
	}
	return s.substring(0, n);
};
