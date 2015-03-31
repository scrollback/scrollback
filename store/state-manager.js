/* jshint browser: true */

var core, config, store;
var objUtils = require("./../lib/obj-utils.js");
var rangeOps = require("./range-ops.js");
var state;
var allChanges = {}, timer = null, numChanges=0;

module.exports = function(c, conf, s, st) {
	config = conf;
	core = c;
    store = s;
	state = st;

	core.on("setstate", function(changes, next) {
		applyChanges(changes, allChanges);
		applyChanges(changes, state);
		buildIndex(state, changes);
		
		if(timer) clearTimeout(timer);
		timer = setTimeout(fireStateChange, 100);
		next();
	}, 1);
};

function fireStateChange() {
	buildIndex(allChanges);
	
	numChanges = 0;
	core.emit("statechange", allChanges);
	allChanges = {};
}

function applyChanges(changes, base) {
	if (changes.nav)      objUtils.extend(base.nav      = base.nav      || {}, changes.nav);
	if (changes.context)  objUtils.extend(base.context  = base.context  || {}, changes.context);
	if (changes.app)      objUtils.extend(base.app      = base.app      || {}, changes.app);
	if (changes.entities) objUtils.extend(base.entities = base.entities || {}, changes.entities);
	
	if (changes.texts)    updateTexts    (base.texts    = base.texts    || {}, changes.texts);
	if (changes.threads)  updateThreads  (base.threads  = base.threads  || {}, changes.threads);
	
	if (changes.session)  base.session = changes.session;
	if (changes.user)     base.user    = changes.user;
}



function updateThreads(baseThreads, threads) {
	var rooms = Object.keys(threads), ranges;

	rooms.forEach(function(roomId) {
		ranges = store.get("threads", roomId);
		if(!ranges) ranges = baseThreads[roomId] = [];

		if(threads[roomId].length) {
			threads[roomId].forEach(function(newRange) {
				baseThreads[roomId] = rangeOps.merge(ranges, newRange, "startTime");
			});
		} else {
			console.log(roomId + ' has no threads yet.');
		}
	});
}

function updateTexts(baseTexts, texts) {
	var rooms = Object.keys(texts), ranges;

	rooms.forEach(function(roomThread) {
		ranges = store.get("texts", roomThread);

		if (!ranges) {
			ranges = baseTexts[roomThread] = [];
		}

		if (texts[roomThread].length) {
			texts[roomThread].forEach(function(newRange) {
				baseTexts[roomThread] = rangeOps.merge(ranges, newRange, "time");
			});
		} else {
			console.log(roomThread);
		}
	});
}

function buildIndex(obj, changes) {
	var relation;
	
	// Changes are passed so that we don’t waste time rebuilding indexes that are still valid.
	if(!changes) changes = obj;

	obj.indexes = obj.indexes || {
		userRooms: {},
		roomUsers: {},
		textsById: {},
		threadsById: {}
	};

	if (obj.entities && changes.entities) {
		obj.indexes.userRooms = {};
		obj.indexes.roomUsers = {};
		for (var name in obj.entities) {
			relation = obj.entities[name];
			if (relation && relation.room && relation.user) {
				(obj.indexes.userRooms[relation.user] = obj.indexes.userRooms[relation.user] || []).push(relation);
				(obj.indexes.roomUsers[relation.room] = obj.indexes.roomUsers[relation.room] || []).push(relation);
			}
		}
	}
	
	
	/* jshint -W083 */
	function buildRangeIndex(obj, prop) {
		var index = obj.indexes[prop+'ById'] = {};
		for(var room in obj[prop]) {
			if(obj[prop][room].forEach) obj[prop][room].forEach(function (range) {
				range.items.forEach(function (item) {
					index[item.id] = item;
				});
			});
		}
	}
	/* jshint +W083 */
	
	if(obj.threads && changes.threads) buildRangeIndex(obj, 'threads');
	if(obj.texts && changes.texts) buildRangeIndex(obj, 'texts');
}
