/* jshint browser: true */
/* global $ */

module.exports = function(core, config, store) {
	function addErrors($dialog, room) {
		var pluginErr;

		if (!(room && room.params)) {
			return;
		}

		Object.keys(room.params).forEach(function(p) {
			if (room.params[p] && room.params[p].error) {

				pluginErr = p;

				$dialog.find(".list-item-" + p + "-settings").addClass("error");
			}
		});

		return pluginErr;
	}

	function renderSettings(items) {
		var $dialog = $("<div>").addClass("settings-container"),
			$list = $("<div>").addClass("settings-list"),
			$views = $("<div>").addClass("settings-view"),
			data = [],
			nav = store.getNav();

		for (var item in items) {
			if (/(room|user)/.test(items)) {
				data.push([items[item].prio, item, items[item]]);
			}
		}

		data.sort(function(a, b) {
			return b[0] - a[0];
		});

		for (var i = 0; i < data.length; i++) {
			if (data[i][2].notify && data[i][2].notify.type) {
				$list.find(".list-item-" + data[i][1] + "-settings").addClass(data[i][2].notify.type);
			}

			$("<a>").addClass("list-item list-item-" + data[i][1] + "-settings ")
				.text(data[i][2].text)
				.appendTo($list);

			$(data[i][2].html).addClass("list-view list-view-" + data[i][1] + "-settings ")
				.appendTo($views);
		}

		$dialog.append($list, $views);

		addErrors($dialog, store.getRoom());

		// set initial classes only after settings have been rendered and DOM is ready.
		if (/(conf|pref)/.test(nav.dialog)) {
			$(".list-item.current, .list-view.current").removeClass("current");
			$(".list-item-" + nav.dialogState + "-settings, .list-view-" + nav.dialogState + "-settings").addClass("current");
		}
	}

	core.on("room-dn", function(action, next) {
		var room = action.room,
			error = false,
			errorItem;

		if (!room.params) {
			return next();
		}

		for (var i in room.params) {
			if (room.params[i].error) {
				error = true;
				errorItem = i;
			}
		}
		if (error) {
			core.emit("conf-show", {
				room: action.room
			}, function(err, items) {
				delete items.room;

				renderSettings(items);

				$(".list-item-" + errorItem + "-settings").addClass("error");

				core.emit("setstate", {
					nav: {
						dialogState: errorItem
					}
				});
			});
		}
		next();
	}, 500);
};
