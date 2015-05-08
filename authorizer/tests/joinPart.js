/* global it */
/*jshint strict: true */

var assert = require('assert');

var Utils = new(require('./utils.js'))();

var makeAction = Utils.makeAction;

module.exports = function(core) {
	"use strict";
	it("should authorize join/part actions", function() {
		var join = makeAction('join', 'follower', 'guest');

		core.emit('join', join, function(err) {
			assert.equal(err.message, "ERR_NOT_ALLOWED", "Guest/Banned/Gagged user was allowed to join");
		});

		join = makeAction('join', 'follower', 'registered');

		core.emit('join', join, function(err) {
			assert.equal(err, null, "Registered User was not allowed to join OpenFollow room");
		});

		join.room.guides.authorizer.openFollow = false;

		core.emit('join', join, function(err, data) {
			assert.equal(data.transitionRole, "follower", "Registered user's transitionRole was not set for a closed Room!");
			assert.equal(data.transitionType, "request", "Registered user's transitionType was not set to request for a closed room!");
		});

		// invited user for non open follow room.

		join = makeAction('join', 'follower', 'registered');
		join.user.transitionRole = "follower";
		join.user.transitionType = "invite";

		join.room.guides.authorizer.openFollow = false;
		core.emit('join', join, function(err) {
			assert.equal(err, null, "Invited user was not allowed to follow closed room");
		});

		// downgrading from moderator to follower

		join = makeAction('join', 'follower', 'moderator');
		core.emit('join', join, function(err) {
			assert.equal(err, null, "Moderator was not allowed to downgrade to follower");
		});

		// follower should be allowed to part the room
		var part = makeAction('part', 'none', 'follower');
		core.emit('part', part, function(err, data) {
			assert.equal(typeof(data.role), "undefined", "Follower was not allowed to unfollow room");
		});
	});
};
