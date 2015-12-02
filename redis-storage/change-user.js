var log = require('../lib/logger.js');

module.exports = function(core, config) {
	return function(action, next) {
		var actionCount = 0, doneCount = 0;
		if (!action.old || !action.old.id || action.user.id === action.old.id) return next();
		if (!action.occupantOf.length) return next();
		log.d("sending away on sign up");
		function done(err, action) {
			doneCount++;
			if (err) log.e("away action failed", err, action);
			log.d("away sent");
			if (actionCount === doneCount) next();
		}
		
		action.occupantOf.forEach(function (room) {
			actionCount++;

			core.emit("away", {
				to: room.id,
				type: "away",
				origin: action.origin,
				session: action.session,
				from: action.old.id,
				time: Date.now()
			}, done);
		});
	};
}
