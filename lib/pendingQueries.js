"use strict";

function generateKey(query) {
	var keyParts = [];
	switch (query.type) {

		case 'getTexts':
		case 'getThreads':
			if (query.to) keyParts.push(query.to);
			if (query.thread) keyParts(query.thread);
			keyParts.push(query.type);
			if (query.ref) keyParts.push(query.ref);
			if (query.time) keyParts.push(query.time);
			if (query.before) {
				keyParts.push("before");
				keyParts.push(query.before);
			}
			if (query.after) {
				keyParts.push("after");
				keyParts.push(query.after);
			}
			break;
		case "getUsers":
		case "getRooms":
		case "getEntities":
			if (query.occupantOf) {
				keyParts.push(query.occupantOf);
				keyParts.push("occupantOf");
			} else if (query.hasOccupant) {
				keyParts.push(query.hasOccupant);
				keyParts.push("hasOccupant");
			} else if (query.memberOf) {
				keyParts.push(query.memberOf);
				keyParts.push("memberOf");
			} else if (query.hasMember) {
				keyParts.push(query.hasMember);
				keyParts.push("hasMember");
			} else {
				keyParts.push(query.type);
			}

			if (query.role) {
				keyParts.push(query.role);
			}

			if (query.ref) {
				keyParts.push(query.ref);
			}
			break;
	}

	return keyParts.join("/");
}

function hasPendingQuery(store, query) {
	var key = generateKey(query);
	var pendingQueries = store.get("pendingQueries", key);

	if (!pendingQueries) return false;

	if (query.type === "getTexts" || query.type === "getThreads") {
		if (query.before && query.before > pendingQueries.before) return false;
		if (query.after && query.after > pendingQueries.after) return false;
	}

	return true;
}

module.exports = {
	generateKey: generateKey,
	hasPendingQuery: hasPendingQuery
};
