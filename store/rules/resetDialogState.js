module.exports = function(core) {
	// Reset dialogState when dialog is changed
	core.on("setstate", function(changes, next) {
		if (changes.nav && changes.nav.dialog === null) {
			changes.nav.dialogState = null;
			changes.nav.dialogUpdate= null;
		}

		next();
	}, 1);
};
