module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			room = future.get("nav", "room"),
			roomObj = future.getRoom();

		if (roomObj === "missing") {
			changes.nav = changes.nav || {};

			if (store.get("nav", "dialog") === "createroom" && changes.nav.dialog === null) {
				changes.nav.mode = "home";
			}

			if (store.get("nav", "mode") === "room" || changes.nav.mode === "room") {
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

		next();
	}, 100);
};
