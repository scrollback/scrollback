/* global $ */

"use strict";

const strings = {
		EN: {
			requiredRoleStr: {
				"gagged": "allowed to speak in this room",
				"guest": "allowed in this room",
				"registered": "signed into scrollback",
				"follower": "a follower of this room",
				"moderator": "a moderator of this room",
				"owner": "an owner of this room"
			},
			reqestedRoleTasks: {
				"gagged": "asking a moderator to unban you",
				"guest": "asking a moderator to remove your gag or ban",
				"registered": "signing into scrollback",
				"follower": "following this room",
				"moderator": "asking to be a moderator of this room",
				"owner": "asking to be an owner of this room"
			},
			actionQueryStr: {
				"admit": "change someone's role",
				"expel": "ban or gag someone",
				"back": "read messages in this room",
				"edit": "edit messages in this room",
				"join": "join this room",
				"part": "leave this room",
				"getRooms": "view the room",
				"getUsers": "view a user's info",
				"room": "save this room",
				"user": "save this user account",
				"text": "send messages",
				"getTexts": "read messages",
				"getThreads": "read discussions"
			},
			currentRoleStr: {
				"moderator": "a moderator",
	            "registered": "a registered user",
				"banned": "banned in this room",
				"gagged": "gagged in this room",
				"none": "not authorized to perform this action",
				"guest": "a guest",
				"follower": "a follower of this room",
				"owner": "the owner of this room"
			}
		}
	};

module.exports = function(error) {
	const actionQueryStr = strings.EN.actionQueryStr[error.action],
		  requiredRoleStr = strings.EN.requiredRoleStr[error.requiredRole],
		  currentRoleStr = strings.EN.currentRoleStr[error.currentRole],
		  requestedRoleTask = strings.EN.reqestedRoleTasks[error.requiredRole];

	let errorMessage = `You should be ${requiredRoleStr} to ${actionQueryStr}, but you're ${currentRoleStr}. Try ${requestedRoleTask} first.`;

	$("<div>").html(errorMessage).alertbar({ type: "error" });
};
