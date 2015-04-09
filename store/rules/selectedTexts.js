module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var mode = store.with(changes).get("nav", "mode");

		if (mode !== "chat") {
			changes.app = changes.app || {};
			changes.app.selectedTexts = [];
			changes.app.currentText = null;
		}

		next();
	}, 100);
};
