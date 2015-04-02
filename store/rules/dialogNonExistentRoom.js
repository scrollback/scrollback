module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var nav = store.get("nav"),
			mode = (changes.nav && changes.nav.mode) ? changes.nav.mode : nav.mode,
			room = (changes.nav && changes.nav.room) ? changes.nav.room : nav.room,
			roomObj;

		if (room) {
			roomObj = (changes.entities && changes.entities[room]) ? changes.entities[room] : store.get("entities", room);

			if (roomObj === "missing") {
				changes.nav = changes.nav || {};

				if (changes.nav && changes.nav.dialog === null && nav.dialog === "createroom") {
					changes.nav.mode = "home";
				} else if (mode === "room") {
					changes.nav.dialog = "createroom";
					changes.nav.dialogState = changes.nav.dialogState || {};
					changes.nav.dialogState.nonexistent = true;

					if (room.indexOf(":") >= 0) {
						changes.nav.dialogState.prefill = room.substring(room.indexOf(":") + 1);
						changes.nav.dialogState.roomIdentity = room;
					} else {
						changes.nav.dialogState.prefill = room;
					}
				}
			}
		}

		next();
	}, 100);
};
