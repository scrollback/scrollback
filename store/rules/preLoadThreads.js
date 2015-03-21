var core, config, store;
//var entityOps = require("./../entity-ops.js");
module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;
	core.on("setstate", function(changes, next) {
		var user = store.get("user") || "", room = store.getNav(room) || "";
		var regex = new RegExp("_" + user + "$");
		if (changes.app && changes.app.featuredRooms) {
			changes.app.featuredRooms.forEach(function(featuredRoomId) {
				loadRecentThreads(featuredRoomId);
			});
		}

		if(changes.entities && user) {
			Object.keys(changes.entities).forEach(function(key) {
				if(regex.test(key) && changes.entities[key] && changes.entities[key].room) {
					loadRecentThreads(changes.entities[key].room);
				}
			});
		}
		next();
	}, 800);
};


function loadRecentThreads(featuredRoomId) {
	
	if(store.get('threads', featuredRoomId)) return;
	
	core.emit("getThreads", {to:featuredRoomId, time: null, before: 3}, function(err, threads) {
		var changes = {
			threads:{}
		};
		if(err || !threads || !threads.results) return;
		changes.threads[threads.to] = [];
		changes.threads[threads.to].push({
			end : null,
			items: threads.results
		});

		if(threads.results.length) {
			changes.threads[threads.to][0].start = threads.results[0].startTime;
		} else {
			changes.threads[threads.to][0].start = null;
		}
		core.emit("setstate", changes);
	});
}
