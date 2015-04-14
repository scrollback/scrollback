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

				$dialog.find("[data-settings-list=" + p + "]").addClass("error");
			}
		});

		return pluginErr;
	}

	function setPage(id, context) {
		var $context = (context instanceof $) ? context : $(document);

		$context.find("[data-settings-list]").removeClass("current");
		$context.find("[data-settings-list=" + id + "]").addClass("current");

		$context.find("[data-settings-view]").removeClass("current");
		$context.find("[data-settings-view=" + id + "]").addClass("current");
	}

	function renderSettings(items) {
		var $page = $("<div>").addClass("settings-page"),
			$list = $("<ul>").addClass("settings-page-content-list"),
			$view = $("<div>").addClass("settings-page-content-view"),
			nav = store.get("nav"),
			settingsItem, title;

		for (var i in items) {
			if (/^(room|user)$/.test(i)) {
				continue;
			}

			$("<li>").addClass("settings-page-content-list-item")
					 .attr("data-settings-list", i)
					 .text(items[i].text)
					 .appendTo($list);

			$("<div>").addClass("settings-page-content-view-item")
					 .attr("data-settings-view", i)
					 .append(items[i].html)
					 .appendTo($view);
		}

		addErrors($list, store.getRoom());

		if (nav.dialog === "conf") {
			title = "Room settings";
		} else if (nav.dialog === "pref") {
			title = "Account settings";
		}

		$("<div>").append(
					   $("<h3>").addClass("settings-page-bar-title").text(title),
					   $("<div>").addClass("settings-page-bar-actions")
								 .append(
										 $("<button>").addClass("secondary settings-page-bar-actions-cancel modal-dismiss")
												 .text("Cancel"),
										 $("<button>").addClass("settings-page-bar-actions-save js-" + nav.dialog + "-save")
												 .text("Save")
										)
					   ).addClass("settings-page-bar").appendTo($page);

		$("<div>").append($list, $view).addClass("settings-page-content").appendTo($page);

		$list.on("click", "[data-settings-list]", function() {
			var id = $(this).attr("data-settings-list");

			core.emit("setstate", {
				nav: { settingsItem: id }
			});
		});

		// Set default page
		for (var state in items) {
			if (/^(room|user)$/.test(state)) {
				continue;
			}

			settingsItem = settingsItem || state;

			if (nav.settingsItem === state) {
				settingsItem = state;

				break;
			}
		}

		setPage(settingsItem, $page);

		return $page;
	}

	core.on("statechange", function(changes, next) {
		if (changes.nav && changes.nav.settingsItem && /^(conf|pref)$/.test(store.get("nav", "dialog"))) {
			setPage(store.get("nav", "settingsItem"));
		}

		next();
	}, 500);

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

	return renderSettings;
};
