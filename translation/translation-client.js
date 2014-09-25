/* jslint browser: true */
/* global $ */

var Translator = (function() {
	var _translateString = function(str, cdata) {
		var data = require("./en_us.js");

		if (cdata) {
			data = $.extend(data, cdata);
		}

		return data[str] || str;
	},
	_translate = function(els, cdata) {
		var $els = $(els);

		$els.each(function() {
			var $this = $(this),
				regex = /(^[aA-zZ\-]+)(::)(.+$)/,
				key = $this.attr("data-string"),
				segments, attr, value;

			if (regex.test(key)) {
				segments = regex.exec(key);
				attr = segments[1];
				value = _translateString(segments[3], cdata);

				$this.attr(attr, value);
			} else {
				value = _translateString(key, cdata);

				$this.text(value);
			}
		});

		return $els;
	};

	return function() {
		var _this = this;

		_this.translate = _translate;

		_this.translateString = _translateString;

		_this.translateAll = function(cdata) {
			$(function() {
				var $els = $("[data-string]");

				return _translate($els, cdata);
			});
		};
	};
}());

module.exports = new Translator();
