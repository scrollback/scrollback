/*global describe, it*/
var assert = require('assert');
var _ = require('underscore');

var userCache = require('./userCache.js');
var members = [{id: 'member1', description: "testmember1"}, {id: 'member2', description: "testmember2"}];
var occupants = [{id: 'occupant1', description: "testoccupant1"}, {id: 'occupant2', description: "testoccupant2"}];

describe("User cache ", function () {

    it("should add new members to a room that does not exist ", function () {
		userCache.putMembers("testroom1", members);
		var res = userCache.getMembers("testroom1");
		assert.equal(_.isEqual(members, res), true, "Assertion Error!");
    });

    it("should add a new member to a room that already exists ", function () {
		var newMember = {id: 'member3', description: "testmember3"};
		members.push(newMember);
		
		userCache.putMembers("testroom1", newMember);
		
		var res = userCache.getMembers("testroom1");
		assert.equal(_.isEqual(members, res), true, "Assertion Error!");
    });

    it("should add occupants to a room that does not exist", function () {
		userCache.putOccupants("testroom1", occupants);
		var res = userCache.getOccupants("testroom1");
		assert.equal(_.isEqual(occupants, res), true, "Assertion Error!");
    });
	
	it("should return a member object with ref query ", function () {
		var mem2 = [members[1]];
		var res = userCache.getMembers("testroom1", "member2");
		assert.equal(_.isEqual(mem2, res), true, "Assertion Error!");
	});
	
    it("should add an occupant to a room that already exists", function () {
		var newOccupant = {id: 'occupant3', description: "testoccupant3"};
		userCache.putOccupants("testroom1", newOccupant);
		occupants.push(newOccupant);
		var res = userCache.getOccupants("testroom1");
		assert.equal(_.isEqual(occupants, res), true, "Assertion Error!");
    });

    it("should remove a member from a room", function () {
		userCache.removeMembers("testroom1", "member1");
		var res = userCache.getMembers("testroom1");
		members.splice(0, 1);
		assert.equal(_.isEqual(members, res), true, "Assertion Error!");
    });

    it("should remove an occupant from a room", function () {
		userCache.removeOccupants("testroom1", "occupant1");
		var res = userCache.getOccupants("testroom1");
		occupants.splice(0, 1);
		assert.equal(_.isEqual(occupants, res), true, "Assertion Error!");
    });
});