module.exports = function(core, config, store) {
	// Reset dialogState when dialog is changed to null
	core.on("setstate", function(changes, next) {
		var dialog = store.with(changes).get("nav", "dialog");

		if ((changes.nav && changes.nav.dialog === null) || dialog === null) {
			changes.nav.dialogState = null;
		}

		next();
	}, 1);
};
