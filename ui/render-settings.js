/* jshint browser: true */
/* global libsb, $ */

module.exports = function (tabs) {
	var $items = $("<div>"),
		$views = $("<div>"),
		data = [];

	for (var tab in tabs) {
		data.push([tabs[tab].prio, tab, tabs[tab]]);
	}

	data.sort(function (a, b) {
		return b[0] - a[0];
	});

	for (var i = 0; i < data.length; i++) {
		if (data[i][2].notify && data[i][2].notify.type) {
			$items.find(".list-item-" + data[i][1] + "-settings").addClass(data[i][2].notify.type);
		}
		
		$("<a>").addClass("list-item list-item-" + data[i][1] + "-settings ")
			.text(data[i][2].text)
			.appendTo($items);

		$(data[i][2].html).addClass("list-view list-view-" + data[i][1] + "-settings ")
			.appendTo($views);
	}

	return [$items, $views, data[0][1]];
};