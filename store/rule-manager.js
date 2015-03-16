module.exports = function(core, config, store) {
	require("./rules/loadRooms.js")(core, config, store);
	require("./rules/loadRelatedUsers.js")(core, config, store);
	require("./rules/handleUserPresence.js")(core, config, store);
	require("./rules/preLoadThreads.js")(core, config, store);
	require("./rules/preLoadTexts.js")(core, config, store);
	require("./rules/resetNavRanges.js")(core, config, store);
	require("./rules/loadTextsOnNav.js")(core, config, store);
	require("./rules/loadThreadsOnNav.js")(core, config, store);
	require("./rules/callToAction.js")(core, config, store);
};
