module.exports = function(core, config, store) {
	// Reset dialogState when dialog is reset
	core.on("setstate", function(changes, next) {
		if (!store.with(changes).get("nav", "dialog")) {
			changes.nav = changes.nav || {};
			changes.nav.dialogState = null;
		}

		next();
	}, 1);
};
