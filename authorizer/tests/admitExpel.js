/* global it */
var assert = require('assert');

var Utils = new(require('./utils.js'))();

var makeAction = Utils.makeAction;

module.exports = function (core) {
	it("should authorize admit expel actions", function () {

		// guests should not be allowed to send admit/expel 
		var admit = makeAction('admit', 'follower', 'guest', 'registered');
		core.emit('admit', admit, function (err) {
			assert.equal(err.message, 'ERR_NOT_ALLOWED', "Guest was allowed to admit/expel");
		});

		// users should not admit/expel other users who are above/same level as them
		var expel = makeAction('expel', 'none', 'follower', 'follower');
		core.emit('expel', expel, function (err) {
			assert.equal(err.message, 'ERR_NOT_ALLOWED', "User was allowed to admit/expel another user of same station");
		});

		// followers should be allowed to invite other users
		admit = makeAction('admit', 'follower', 'follower', 'registered');
		core.emit('admit', admit, function (err, data) {
			assert.equal(data.transitionRole, 'follower', "Follower was not allowed to invite other followers in openFollow");
			assert.equal(data.transitionType, 'invite', "Follower was not allowed to invite other followers (Transition type is not request)");
		});

		// moderators should not be allowed to promote other users to moderators 
		admit = makeAction('admit', 'moderator', 'moderator', 'follower');
		core.emit('admit', admit, function (err) {
			assert.equal(err.message, 'ERR_NOT_ALLOWED', "Moderator was allowed to make another user a moderator");
		});

		// owners should be allowed to invite users to become moderators.
		admit = makeAction('admit', 'moderator', 'owner', 'registered');
		core.emit('admit', admit, function (err, data) {
			assert.equal(data.transitionRole === 'moderator' && data.transitionType === "invite", true,
				"Owner should be allowed to make another user a moderator");
		});

		// moderators & owners should be allowed to expel users
		expel = makeAction('expel', 'none', 'moderator', 'follower');
		core.emit('expel', expel, function (err, data) {
			assert.equal(typeof (data.role), "undefined", "Owners & moderators should be able to expel users");
		});
		// owners should be allowed to demote moderators.
		expel = makeAction('expel', 'follower', 'owner', 'moderator');
		core.emit('expel', expel, function (err, data) {
			assert.equal(data.role, "follower", "Owners should be able to demote moderators");
		});

		// owners should be able to create other owners
		admit = makeAction('admit', 'owner', 'owner', 'registered');
		core.emit('admit', admit, function (err, data) {
			assert.equal(data.transitionRole === 'owner' && data.transitionType === "invite", true,
				"Owner should be allowed to create other owners");
		});
	});
};