var core, config, store;
//var entityOps = require("./../entity-ops.js");

var query;

module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;
	
	query = require("../bulkQuery.js")(core, store, "texts");
	
	core.on("setstate", function(changes, next) {
		var room = store.getNav("room") || "",
			current = store.get(),
			threadRanges;
		
		if(
			(changes.nav && changes.nav.mode ||
			current.nav && current.nav.mode) == "room" && // don’t bother except in the room mode
			(
				changes.threads && changes.threads[room] || // either the threads have changed, or
				changes.nav && (room = changes.nav.room) && // we are switching rooms, whose
				current.threads && current.threads[room] // threads were previously loaded
			)
		) {
			threadRanges = [].concat(
				changes.threads && changes.threads[room] || [],
				current.threads && current.threads[room] || []
			);
			
			threadRanges.forEach(function(threadRange) {
				if(threadRange.items && threadRange.items.length) {
					threadRange.items.forEach(function(threadObj) {
						query(room + '_' + threadObj.id);
					});
				}
			});
		}
		
		next();
	}, 800);
};
//
//
//function loadRecentTexts(roomId, threadId) {
//	var key = roomId+"_"+threadId;
//	
//	if(store.get('texts', key) && store.get('texts', key).length) {
////		console.log('texts already exist for ', threadId, 'Skipping');
//		return; // Already there.
//	}
//	
//	window.queryCount = (window.queryCount || 0)+1;
//	
//	core.emit("getTexts", {to:roomId, thread:threadId, time: null, before: 3}, function(err, texts) {
//		var changes = { texts:{} };
//		if(err || !texts || !texts.results) return;
//		
//		changes.texts[key] = [];
//		changes.texts[key].push({
//			end : null,
//			items: texts.results
//		});
//		
//		if(texts.results.length) {
//			changes.texts[key][0].start = texts.results[0].time;
//		} else {
//			changes.texts[key][0].start = null;
//		}
//		core.emit("setstate", changes);
//	});
//}