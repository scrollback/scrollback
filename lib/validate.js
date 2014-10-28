var validate = function(name, sanitize) {
	var room;

	if (typeof name !== "string") {
		name = "";
	}

	room = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/, "").trim();

	if (/^[0-9]*$/.test(room)) {
		room = "";
	}

	if (!room) {
		room = "scrollback";
	} else if (room.length < 3) {
		room = room + Array(4 - room.length).join("-");
	}

	room = room.substring(0, 32);

	if (sanitize) {
		return room;
	}

	if (typeof name !== "string") {
		throw new Error("Room name is of invalid type!");
	} else if (name === "") {
		throw new Error("Room name cannot be empty!");
	} else if (/[^0-9a-z\-]/.test(name)) {
		throw new Error("Room name can contain only lowercase letters, digits and hyphens (-)!");
	} else if (name.length < 3) {
		throw new Error("Room name must be at least 3 letters long!");
	} else if (/^[^a-z]/.test(name)) {
		throw new Error("Room name must start with a lower case letter!");
	} else if (name !== room) {
		throw new Error("Room name is invalid!");
	} else {
		return true;
	}
};

module.exports = validate;
