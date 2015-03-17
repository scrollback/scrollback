var core, config, store;
//var entityOps = require("./../entity-ops.js");
module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;
	core.on("setstate", function(changes, next) {
		var room = store.getNav("room") || "",
			current = store.get();
		
		if (changes.threads && changes.threads[room]) {
			changes.threads[room].forEach(function(threadRange) {
				if(threadRange.items && threadRange.items.length){
					threadRange.items.forEach(function(threadObj) {
						loadRecentTexts(room, threadObj.id);
					});
				}
			});
		}
				
		if (changes.nav && (room = changes.nav.room) && current.threads && current.threads[room]) {
			current.threads[room].forEach(function(threadRange) {
				if(threadRange.items && threadRange.items.length){
					threadRange.items.forEach(function(threadObj) {
						loadRecentTexts(room, threadObj.id);
					});
				}
			});
		}
		
		next();
	}, 800);
};


function loadRecentTexts(roomId, threadId) {
	var key = roomId+"_"+threadId;
	
	if(store.get('texts', key) && store.get('texts', key).length) {
//		console.log('texts already exist for ', threadId, 'Skipping');
		return; // Already there.
	}
	
	core.emit("getTexts", {to:roomId, thread:threadId, time: null, before: 3}, function(err, texts) {
		var changes = { texts:{} };
		if(err || !texts || !texts.results) return;
		
		changes.texts[key] = [];
		changes.texts[key].push({
			end : null,
			items: texts.results
		});
		
		if(texts.results.length) {
			changes.texts[key][0].start = texts.results[0].time;
		} else {
			changes.texts[key][0].start = null;
		}
		core.emit("setstate", changes);
	});
}