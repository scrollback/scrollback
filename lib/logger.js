"use strict";

var util = require("util");

var log = function (tag, message) {
	var s = util.format.apply(util, arguments).replace(/\s+/g, ' ');
	var l = (new Error()).stack.
		replace(/.*(Error|node_modules|logger).*\n/g, ''). // remove lines with these words
		replace(/\n[\s\S]*$/, '').  // take the first line
		replace(/^[\s\S]*?\/scrollback[^\/]*\//, '').      // relative path
		replace(/[\)\(]/g, '');
	var d = (new Date()).toISOString().replace('T', ' ').replace(/\.\w*$/, '');
		
	console.log("%s\t%s\t%s", l, d, s);
};

log.tag = function (tag) {
	return function() {
		var tok = [].splice.call(arguments, 0);
		tok.unshift(tag);
		log.apply(this, tok);
	};
};

module.exports = log;