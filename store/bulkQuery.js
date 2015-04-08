var objUtils = require("./../lib/obj-utils.js");

module.exports = function createBulkQuery(core, store, type) {
	var queryCount=0,
		changes = {},
		queriedRooms = {};

	changes[type] = {};

	function add(roomId) {
		if(queriedRooms[roomId]) return;
		queriedRooms[roomId] = true;


		if(type === "texts") {
			roomId = roomId.split("_");
			if(store.getTexts(roomId[0], roomId[1], null, -3)[0] !== "missing") return;
//			console.log('getting more texts', queryCount);
//			process.nextTick(function () {
				queryCount++;
				core.emit("getTexts", {to:roomId[0], thread: roomId[1], time: null, before: 3}, done);
//			});
		} else {
			if(store.getThreads(roomId, null, -3)[0] !== "missing") return;
//			process.nextTick(function () {
				queryCount++;
				core.emit("getThreads", {to:roomId, time: null, before: 3}, done);
//			});
		}
	}

	function done(err, query) {
		var key;
		queryCount--;
//		if(type === 'texts') console.log('query came back', queryCount);
		if(query && query.results && query.results.length) {
			key = query.to + (query.thread? "_" + query.thread: "");

			(changes[type][key] = changes[type][key] || []).push({
				start: query.results.length? (
					query.results[0][type === "texts"? "time": "startTime"]
				) : null,
				end : null,
				items: query.results
			});
//			console.log(changes);
		}
		if(queryCount === 0 && Object.keys(changes[type]).length) {
//			console.log('emitting ', changes);
			core.emit("setstate", objUtils.clone(changes));
		}
	}

	return add;
};
