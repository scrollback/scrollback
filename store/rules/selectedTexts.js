module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var mode = (changes.mode && changes.nav.mode) ? changes.nav.mode : store.get("nav", "mode");

		if (mode !== "chat") {
			changes.nav = changes.nav || {};
			changes.nav.selectedTexts = [];
			changes.nav.currentText = null;
		}

		next();
	}, 100);
};
