module.exports = function(core) {
	core.on("edit", function(action, next) {
		// Add tags from labels if not present
		if (action.labels && !action.tags) {
			action.tags = [];

			for (var label in action.labels) {
				if (action.labels[label] > 0.5) {
					action.tags.push(label);
				}
			}
		}

		// Add labels from tags if not present
		if (action.tags && !action.labels) {
			action.labels = {};

			for (var i = 0, l = action.tags.length; i < l; i++) {
				action.labels[action.tags[i]] = 1;
			}
		}

		// If no threads property is present, add it
		if (action.thread && !action.threads) {
			action.threads = [{
				id: action.thread,
				title: action.title,
				score: 1.0
			}];
		}

		next();
	}, "validation");

};
