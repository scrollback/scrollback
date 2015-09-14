"use strict";

module.exports = (...args) => {
	require("./rules/loadRooms.js")(...args);
	require("./rules/loadRelatedUsers.js")(...args);
	require("./rules/handleUserPresence.js")(...args);
	require("./rules/preLoadThreads.js")(...args);
	require("./rules/preLoadTexts.js")(...args);
	require("./rules/resetNavRanges.js")(...args);
	require("./rules/loadTextsOnNav.js")(...args);
	require("./rules/loadThreadsOnNav.js")(...args);
	require("./rules/ctaDownloadApp.js")(...args);
	require("./rules/ctaFollow.js")(...args);
	require("./rules/ctaSignIn.js")(...args);
	require("./rules/dismissCta.js")(...args);
	require("./rules/dialogSignup.js")(...args);
	require("./rules/dialogAndroid.js")(...args);
	require("./rules/resetDialogState.js")(...args);
	require("./rules/resetFocus.js")(...args);
	require("./rules/selectedTexts.js")(...args);
	require("./rules/removeRelations.js")(...args);
	require("./rules/embedNavigate.js")(...args);
	require("./rules/dissmissNoteOnNav.js")(...args);
	require("./rules/clearQueuedActions.js")(...args);
};
