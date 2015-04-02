module.exports = function(core) {
	// Reset dialogState when dialog is changed to null
	core.on("setstate", function(changes, next) {
		if (changes.nav && changes.nav.dialog === null) {
			changes.nav.dialogState = null;
		}

		next();
	}, 1);
};
