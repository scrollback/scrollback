/* eslint-env browser */

"use strict";

exports.uid = function(num) {
	var n, a, i, s, crypto = window.crypto || window.msCrypto;

	n = (typeof num !== "number" || isNaN(num)) ? 32 : num;

	if (crypto) {
		a = crypto.getRandomValues(new Uint8Array(Math.ceil(n / 2)));

		for (i = 0; i < a.length; i++) {
			s += a[i].toString(16);
		}
	} else {
		for (i = 0; i < Math.ceil(n / 4); i++) {
			s += ((Math.random() * 256 * 256) | 0).toString(16);
		}
	}

	return s.substring(0, n);
};
