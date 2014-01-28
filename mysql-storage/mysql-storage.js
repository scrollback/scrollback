/* global require, module */

module.exports = function(core) {
	require("./members/members.js")(core);
	require("./message/message.js")(core);
	require("./messages/messages.js")(core);
	require("./room/room.js")(core);
	require("./rooms/rooms.js")(core);
};
