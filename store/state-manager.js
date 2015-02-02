var config;
/********remove this after testing.**********/
var state = {
	nav: {},
	content: {},
	context: {},
	user: {},
	entities: {},
	sessions: {}
};
/******************/
var rangeOps = require("../lib/rangeOps.js");
module.exports = function(core, conf) {
	config = conf;
	core.on("setState", function(newState, next) {
		/*
            loadContent to store if from changes.
        */
		if (newState.changes.nav) updateNav(newState.changes.nav, state.nav);
		if (newState.changes.entities) updateEntities(newState.changes.entities);
		if (newState.changes.content) updateContent(newState.changes.content);
		next();
	});
};

function updateNav(nav, stateNav) {
	var keys = Object.keys(nav);
	keys.forEach(function(e) {
		if (keys[e] && typeof keys[e] == "object") {
			if (stateNav[e]) updateNav(keys[e], stateNav[e]);
			else stateNav[e] = keys[e];
		} else {
			stateNav[e] = keys[e];
		}
	});
}


function updateEntities(entities) {
	var ids = Object.keys(entities);
	ids.forEach(function(id) {
		if (entities[id] === null) {
			delete state.entities[id];
		} else {
			state.entities[id] = entities[id];
		}
	});
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
		var index = state.indexes[type + "ById"] = state.indexes[type + "ById"] || {};
		r.items.forEach(function(item) {
			index[item.id] = item;
		});
	});
}