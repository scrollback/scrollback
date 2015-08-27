/* eslint-env browser */

"use strict";

exports.uid = function(num) {
	var n, a, i, l, s = "", crypto = window.crypto || window.msCrypto;

	n = (typeof num !== "number" || isNaN(num)) ? 32 : num;

	if (crypto) {
		a = new Uint8Array(Math.ceil(n / 2));

		crypto.getRandomValues(a);

		for (i = 0, l = a.length; i < l; i++) {
			s += a[i].toString(16);
		}
	} else {
		for (i = 0, l = Math.ceil(n / 4); i < l; i++) {
			s += ((Math.random() * 256 * 256) | 0).toString(16);
		}
	}

	return s.substring(0, n);
};
