var log = function (tag, message) {
	var tok = [].splice.call(arguments, 0);
	var loc = (new Error()).stack.split(/\n\s*at\s*/)[3].replace(/[\(\)]/g, '').
		replace(/^.*\/scrollback[^\\]*\//g, '');
	tok.unshift(loc + "\t" + (new Date()).toISOString() + "\t");
	console.log.apply(this, tok);
};

log.tag = function (tag) {
	return function() {
		var tok = [].splice.call(arguments, 0);
		tok.unshift(tag);
		log.apply(this, tok);
	};
};

module.exports = log;