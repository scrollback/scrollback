"use strict";
var _ = require('underscore');
var userOps = require("../lib/app-utils.js");

function generateMentions(action, next) {
	// work on the mentions here.

	var members = action.members, occupants = action.occupants;
	var users = members.concat(occupants), candidates = {}, mentions;

	users.forEach(function(u) {
		if (userOps.isGuest(u.id)) candidates[u.id.replace(/^guest-/, '')] = true;
	});
	candidates = Object.keys(candidates);

	mentions = action.text.split(" ").map(function(word) {
		if (((/^@[a-z][a-z0-9\_\-\(\)]{2,32}[:,]?$/i).test(word) || (/^[a-z][a-z0-9\_\-\(\)]{2,32}:$/i).test(word)) && _.contains(users, word.replace(/[@:]/, ''))) {
			return word.replace(/[@:]/, '');
		}
	});
	mentions = mentions.concat(action.mentions);
	mentions = _.uniq(mentions, function(m) {
		return m;
	});
	action.mentions = _.compact(mentions);
	next();
}

module.exports = generateMentions;
