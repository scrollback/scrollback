/* jshint browser: true */
/* global $ */

var personEl = {};

$(function() {
	var $template = $(".person").eq(0);

	personEl.render = function (el, person, index) {
		el = el || $template.clone(false);

		el.find('.name').text(person.id.replace(/^guest-/, ''));
		el.find('.picture').attr({src: person.picture.replace(/\%s/g, '48')});
		el.data('index', index);

		return el;
	};
});

window.personEl = personEl;
