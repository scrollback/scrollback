module.exports = function(core, config, store) {
	require("./rules/loadRooms.js")(core, config, store);
	require("./rules/loadRelatedUsers.js")(core, config, store);
	require("./rules/handleUserPresense.js")(core, config, store);
	require("./rules/resetNavRanges.js")(core, config, store);
};
