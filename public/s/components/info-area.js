/* jshint browser: true */
/* global $, format */

var infoArea = {};

$(function() {
	var $template = $(".pane-info").eq(0);

	infoArea.render = function (room) {
		console.log("Rendering room", room);
		$template.find('.name').text(room.id);
		$template.find('.description').html(format.textToHtml(room.description || "This room has no description."));
	};
});
