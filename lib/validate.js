var validate = function(name) {
	var room = (typeof name === "string") ? name : "",
		defaultRoom = "scrollback",
		reserved = [ "img", "css", "sdk" ],
		result = {
			isValid: true,
			sanitized: room,
			error: false
		};

	room = room.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/^-+|-+$/, "").trim();

	if (/^[0-9]*$/.test(room)) {
		room = "";
	}

	if (!room) {
		room = defaultRoom;
	} else if (room.length < 3) {
		room = room + Array(4 - room.length).join("-");
	} else {
		reserved.forEach(function(w) {
			if (room === w) {
				room = defaultRoom;
				result.error = "name cannot be a reserved word";
			}
		});
	}

	room = room.substring(0, 32);

	result.sanitized = room;

	if (typeof name !== "string") {
		result.error = "name is of invalid type!";
	} else if (name === "") {
		result.error = "name cannot be empty!";
	} else if (/[^0-9a-z\-]/.test(name)) {
		result.error = "name can contain only lowercase letters, digits and hyphens (-)!";
	} else if (name.length < 3) {
		result.error = "name must be at least 3 characters long!";
	} else if (name.length > 32) {
		result.error = "name cannot be longer than 32 characters!";
	} else if (/^[^a-z0-9]/.test(name)) {
		result.error = "name must start with a lower case letter or number!";
	} else if (/^[0-9]+$/.test(name)) {
		result.error = "name cannot contain only numbers!";
	} else if (name !== room) {
		result.error = "name is invalid!";
	}

	if (result.error) {
		result.isValid = false;
	}

	return result;
};

module.exports = validate;
