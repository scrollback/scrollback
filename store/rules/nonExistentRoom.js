module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			room = future.get("nav", "room"),
			dialog = future.get("nav", "dialog"),
			roomObj = future.getRoom();

		if (room) {
			roomObj = (changes.entities && changes.entities[room]) ? changes.entities[room] : store.get("entities", room);

			if (roomObj === "missing") {
				changes.nav = changes.nav || {};

				if (changes.nav && changes.nav.dialog === null && dialog === "createroom") {
					changes.nav.mode = "home";
				} else {
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
