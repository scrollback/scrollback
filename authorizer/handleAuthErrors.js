/* global $ */

"use strict";

const strings = {
	EN: {
		requiredRoleStr: {
			"registered": "signed in",
			"follower": "a follower of this room",
			"moderator": "a moderator of this room",
			"owner": "an owner of this room"
		},
		currentRoleTasks: {
			"banned": "",
			"guest": "signing in"
		},
		requiredRoleTasks: {
			"follower": "following this room",
			"moderator": "asking to be a moderator of this room",
			"owner": "asking to be an owner of this room"
		},
		actionQueryStr: {
			"admit": "change someone's role",
			"expel": "ban or gag someone",
			"back": "enter this room",
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
			"banned": "banned in this room",
			"gagged": "gagged in this room",
			"follower": "a follower of this room",
			"owner": "the owner of this room"
		}
	}
};

module.exports = function(error) {
	const actionQueryStr = strings.EN.actionQueryStr[error.action],
		requiredRoleStr = strings.EN.requiredRoleStr[error.requiredRole],
		currentRoleStr = strings.EN.currentRoleStr[error.currentRole],
		task = strings.EN.reqestedRoleTasks[error.requiredRole] || strings.EN.currentRoleTasks[error.currentRole];

	let errorMessage = [
		(requiredRoleStr ? `You should be ${requiredRoleStr} to ${actionQueryStr}.` : ""),
		(currentRoleStr ? `You're ${currentRoleStr}.` : ""),
		(task ? `Try ${task} first.` : "")
	].join(" ");

	$("<div>").html(errorMessage).alertbar({
		type: "error"
	});
};
