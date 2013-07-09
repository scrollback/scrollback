module.exports = function () {
	"use strict";
    var str="", i;
	for(i=0; i<32; i++) str += (Math.random()*16|0).toString(16);
	return str;
}