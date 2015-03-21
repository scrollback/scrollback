module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var nav = store.get("nav"),
			mode, room, roomObj;

		mode = (changes.nav && changes.nav.mode) ? changes.nav.mode : nav.mode;
		room = (changes.nav && changes.nav.room) ? changes.nav.room : nav.room;

		if (!/(chat|room)/.test(mode)) {
			return next();
		}

		if (room) {
			roomObj = (changes.entities && changes.entities[room]) ? changes.entities[room] : store.get("entities", room);

			if (roomObj === "missing") {
				changes.nav = changes.nav || {};

				if (changes.nav && changes.nav.dialog === null && nav.dialog === "createroom") {
					changes.nav.mode = "home";
				} else {
					changes.nav.dialog = "createroom";
					changes.nav.dialogState = "nonexistent";
				}
			}
		}

		next();
	}, 100);
};
