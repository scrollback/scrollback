var config, store;
var rangeOps = require("./range-ops.js");
var oldStore;
module.exports = function(core, conf, s) {
	config = conf;
    store = s;
    console.log("+++++",oldStore);
	core.on("setState", function(newState, next) {
		if (newState.nav) updateNav(newState.nav);
		if (newState.entities) updateEntities(newState.changes.entities);
		if (newState.texts) updateTexts(newState.texts);
		next();
	}, 1000);
};
module.exports.setStore = function(s) {
	console.log("setting oldStore.");
	oldStore = s;
};


function updateTexts(texts) {
	var rooms = Object.keys(texts), ranges;
	rooms.forEach(function(room) {
		var threads = Object.keys(room.textRanges);
		threads.forEach(function(thread) {
			ranges = store.get("texts", room, thread);
			if(!ranges) ranges = store.texts[room][thread] = [];
			texts.textRanges[thread].forEach(function(newRange) {
				rangeOps.merge(ranges, newRange);
			});
		});
	});
}

function updateNav(nav) {
	var keys = Object.keys(nav);
	keys.forEach(function(e) {
		if (nav[e] && typeof nav[e] == "object") {
			oldStore.nav[e] = clone(nav[e]); //TODO: clone objects.
		} else {
			oldStore.nav[e] = nav[e];
		}
	});
}

function clone(){
}


function updateEntities(entities) {
	var ids = Object.keys(entities);
	ids.forEach(function(id) {
		if (entities[id] === null) {
			delete store.entities[id];
		} else {
			store.entities[id] = entities[id];
		}
	});
	updateContent();
}


function updateContent(content) {
	var rooms = Object.keys(content);
	rooms.forEach(function(e) {
		if (content[e].textRanges) {
			updateIndex("text", content[e].textRanges);
			rangeOps(e, content[e].textRanges);
		}
		if (content[e].threadRanges) {
			updateIndex("thread", content[e].textRanges);
			rangeOps(e, content[e].threadRanges);
		}
	});
}

function updateIndex(type, ranges) {
	ranges.forEach(function(r) {
		var index = store.indexes[type + "ById"] = store.indexes[type + "ById"] || {};
		r.items.forEach(function(item) {
			index[item.id] = item;
		});
	});
}