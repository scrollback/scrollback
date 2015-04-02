module.exports = function(core, config, store) {
	// Reset dialogState when dialog is null
	core.on("setstate", function(changes, next) {
		var dialog = (changes.nav && changes.nav.dialog) ? changes.nav.dialog : store.get("nav", "dialog");

		if (!dialog) {
			changes.nav.dialogState = null;
		}

		next();
	}, 1);
};
