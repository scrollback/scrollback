/* jshint browser: true */
/* global currentState, libsb, $ */
function renderSettings(tabs) {
	
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
	
	
	switch(currentState.mode) {
		case "pref":
			$('.meta-pref').empty().append($items);
			$('.pref-area').empty().append($views);
			break;
			
		case "conf":
			$('.meta-conf').empty().append($items);
			$('.conf-area').empty().append($views);
			break;
	}
	
	libsb.emit("navigate", {tab: data[0][1]});
	
	addErrors(currentState.room);

}

libsb.on("room-dn", function(action, next) {
	var room = action.room;
	var error = false, errorTab;
	if (!room.params) return next();
	for (var i in room.params) {
		if (room.params[i].error) {
			error = true;
			errorTab = i;
		}
	}
	if(error){ 
		libsb.emit("config-show", {room: action.room}, function(err, tabs){
			delete tabs.room;
			renderSettings(tabs);
			$(".list-item-" + errorTab + "-settings").addClass("error");
			libsb.emit("navigate", {tab: errorTab});
		});
	}
	next();
}, 500);

function addErrors(room) {
	var pluginErr;
	Object.keys(room.params).forEach(function(p) {
		if (room.params[p] && room.params[p].error) {
			pluginErr = p;
			$(".list-item-" + p + "-settings").addClass("error");
		}
	});
	return pluginErr;
}

module.exports = renderSettings;