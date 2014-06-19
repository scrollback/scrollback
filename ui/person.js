/* jshint browser: true */
/* global $ */

var personEl = {};

$(function() {
	var $template = $(".person").eq(0);

	personEl.render = function (el, person, index) {
		el = el || $template.clone(false);

		el.find('.person-avatar').attr({src: person.picture});
		el.find('.person-name').text(person.id.replace(/^guest-/, ''));
		if(person.status!== "online") el.addClass("offline");
		el.data('index', index);

		return el;
	};
});

window.personEl = personEl;
