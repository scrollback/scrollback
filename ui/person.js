/* jshint browser: true */
/* global $ */

var personEl = {};

$(function() {
	var $template = $(".person").eq(0);

	personEl.render = function ($el, person, index) {
		$el = $el || $template.clone(false);

		$el.find(".person-avatar").attr({src: person.picture});
		$el.find(".person-name").text(person.id.replace(/^guest-/, ""));
		$el.attr("data-index", index);

		if (person.status !== "online") {
			$el.addClass("offline");
		}

		return $el;
	};
});

module.exports = personEl;
