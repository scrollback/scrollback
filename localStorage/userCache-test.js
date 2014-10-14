/*global describe, it*/
var assert = require('assert');
var _ = require('underscore');

var userCache = require('./objCacheOps.js');
var members = [{id: 'member1', description: "testmember1"}, {id: 'member2', description: "testmember2"}];
var occupants = [{id: 'occupant1', description: "testoccupant1"}, {id: 'occupant2', description: "testoccupant2"}];

describe("User cache ", function () {
	
	
    it("should add new members to a room that does not exist ", function (done) {
		userCache.putMembers("testroom1", members);
		userCache.getMembers("testroom1", null, function (res) {
            assert.equal(_.isEqual(members, res), true, "Assertion Error!");
            done();
        });
    });

    it("should add a new member to a room that already exists ", function (done) {
		var newMember = {id: 'member3', description: "testmember3"};
		members.push(newMember);
		
		userCache.putMembers("testroom1", newMember);
		
		userCache.getMembers("testroom1", null, function (res) {
            assert.equal(_.isEqual(members, res), true, "Assertion Error!");
            done();
        });

    });

    it("should add occupants to a room that does not exist", function (done) {
		userCache.putOccupants("testroom1", occupants);
		userCache.getOccupants("testroom1", null, function (res) {
            assert.equal(_.isEqual(occupants, res), true, "Assertion Error!");
            done();
        });
    });
	
	it("should return a member object with ref query ", function (done) {
		var mem2 = [members[1]];
		userCache.getMembers("testroom1", "member2", function (res) {
            assert.equal(_.isEqual(mem2, res), true, "Assertion Error!");
            done();
        });
	});
	
    it("should add an occupant to a room that already exists", function (done) {
		var newOccupant = {id: 'occupant3', description: "testoccupant3"};
		userCache.putOccupants("testroom1", newOccupant);
		occupants.push(newOccupant);
		userCache.getOccupants("testroom1", null, function (res) {
            assert.equal(_.isEqual(occupants, res), true, "Assertion Error!");
            done();
        });
    });

    it("should remove a member from a room", function (done) {
		userCache.removeMembers("testroom1", {id: 'member1', description: "testmember1"});
		userCache.getMembers("testroom1", null, function (res) {
            members.splice(0, 1);
            assert.equal(_.isEqual(members, res), true, "Assertion Error!");
            done();
        });
    });

    it("should remove an occupant from a room", function (done) {
		userCache.removeOccupants("testroom1", {id: 'occupant1', description: "testoccupant1"});
		userCache.getOccupants("testroom1", null, function (res) {
            occupants.splice(0, 1);
            assert.equal(_.isEqual(occupants, res), true, "Assertion Error!");
            done();
        });
    });
});