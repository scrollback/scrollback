"use strict";

module.exports = function(core, config, store) {
	require("./rules/loadRooms.js")(core, config, store);
	require("./rules/loadRelatedUsers.js")(core, config, store);
	require("./rules/handleUserPresence.js")(core, config, store);
	require("./rules/preLoadThreads.js")(core, config, store);
	require("./rules/preLoadTexts.js")(core, config, store);
	require("./rules/resetNavRanges.js")(core, config, store);
	require("./rules/loadTextsOnNav.js")(core, config, store);
	require("./rules/loadThreadsOnNav.js")(core, config, store);
	require("./rules/ctaDownloadApp.js")(core, config, store);
	require("./rules/ctaFollow.js")(core, config, store);
	require("./rules/ctaSignIn.js")(core, config, store);
	require("./rules/dismissCta.js")(core, config, store);
	require("./rules/dialogSignup.js")(core, config, store);
	require("./rules/dialogAndroid.js")(core, config, store);
	require("./rules/dialogNonExistentRoom.js")(core, config, store);
	require("./rules/resetDialogState.js")(core, config, store);
	require("./rules/resetFocus.js")(core, config, store);
	require("./rules/selectedTexts.js")(core, config, store);
	require("./rules/removeRelations.js")(core, config, store);
	require("./rules/androidApp.js")(core, config, store);
	require("./rules/dismissNotifications.es6")(core, config, store);
	require("./rules/handlePrivateRoom.es6")(core, config, store);
};
