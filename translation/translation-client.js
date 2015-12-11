/* eslint-env browser */
/* global $ */

var Translator = function(cdata) {
	var data = require("./strings.js");

	this.data = cdata ? $.extend(data, cdata) : data;
};

Translator.prototype.translateString = function(str) {
	return this.data[str] || str;
};

Translator.prototype.translate = function(els) {
	var self = this,
		$els = $(els);

	$els.each(function() {
		var $this = $(this),
			regex = /(^[aA-zZ\-]+)(::)(.+$)/,
			key = $this.attr("data-string"),
			segments, attr, value;

		if (regex.test(key)) {
			segments = regex.exec(key);
			attr = segments[1];
			value = self.translateString(segments[3]);

			$this.attr(attr, value);
		} else {
			value = self.translateString(key);

			$this.text(value);
		}
	});

	return $els;
};

Translator.prototype.translateAll = function() {
	var self = this;

	$(function() {
		var $els = $("[data-string]");

		self.translate($els);
	});
};

module.exports = new Translator();
