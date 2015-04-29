module.exports = function(core) {
	core.on("setstate", function(changes, next) {
		if (changes.nav && "mode" in changes.nav && store.with(changes).get("app", "focusedInput")) {
			changes.app = changes.app || {};
			changes.app.focusedInput = null;
		}

		next();
	}, 100);
};
