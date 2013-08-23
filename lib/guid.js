module.exports = function (n) {
	"use strict";
    var str="", i;
	n = n || 32;
	for(i=0; i<n; i++) str += (Math.random()*36|0).toString(36);
	return str;
};
