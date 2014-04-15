var assert = require('assert');
var core = require('../lib/emitter.js');
var generate = require("../lib/generate.js");
require("./leveldb-storage.js")(core);


// describe("Just to try something out quick.",function(){
// 	it("Checking join:", function(done) {
// 		core.emit("getRooms", {hasMember:"harish"}, function(err, data){
// 			console.log(data);			
// 			done();			
// 		});
// 	});
// });
describe("user and room action", function(){
	it("storing user harish", function(done) {
		core.emit("user", {
			id: generate.uid(),
			type:"user",
			user: {
				id:"harish",
				description:"this is me?",
				type:"user",
				picture:"http://gravatar.com/avatar/alscalladf",
				identities:["mailto:harish@scrollback.io"], 
				params:{}
			}
		}, function(err, data){
			assert(!err, "Error thrown");
			done();
		});
	});
	it("storing user arvind", function(done) {
		core.emit("user", {
			id: generate.uid(),
			type:"user",
			user: {
				id:"arvind",
				description:"this is him",
				type:"user",
				picture:"http://gravatar.com/avatar/ksdcnsdjfsl",
				identities:["mailto:arvind@scrollback.io"],
				params:{}
			}
		}, function(err, data){
			assert(!err, "Error thrown");
			done();
		});
	});
	it("storing user amal", function(done) {
		core.emit("user", {
			id: generate.uid(),
			type:"user",
			user: {
				id:"amal",
				description:"this is another him",
				type:"user",
				picture:"http://gravatar.com/avatar/coaubnllnksdj",
				identities:["mailto:amal@scrollback.io"],
				params:{}
			}
		}, function(err, data){
			assert(!err, "Error thrown");
			done();
		});
	});
	it("storing room scrollback", function(done) {
		core.emit("room", {
			id: generate.uid(),
			type:"room",
			room: {
				id:"scrollback",
				description:"this is a room",
				type:"room",
				params:{}
			},
			user: {
				id:"harish",
			}
		}, function(err, data){
			assert(!err, "Error thrown");
			done();
		});
	});
	it("storing room scrollbackteam", function(done) {
		core.emit("room", {
			id: generate.uid(),
			type:"room",
			room: {
				id:"scrollbackteam",
				description:"this is a room",
				type:"room",
				params:{}
			},
			user: {
				id:"arvind",
			}
		}, function(err, data){
			assert(!err, err);
			done();
		});
	});
});


describe("get queries: ", function(){
	it("getting user by id:", function(done) {
		core.emit("getUsers", {ref:"arvind"}, function(err, data){
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results, "no results");
			assert(data.results[0], "empty results");
			assert.equal(data.results[0].id, "arvind", "empty results");
			assert.equal(data.results.length, 1, "extra results returned");
			done();			
		});
	});
	it("getting room by id:", function(done) {
		core.emit("getRooms", {ref:"scrollback"}, function(err, data){
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results, "no results");
			assert(data.results[0], "empty results");
			assert.equal(data.results[0].id, "scrollback", "empty results");
			assert.equal(data.results.length, 1, "extra results returned");
			done();			
		});
	});
	it("getting room that doesnt exist:", function(done) {
		core.emit("getRooms", {ref:"scrollback1"}, function(err, data){
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(!data.results, "why did it give results?");
			done();			
		});
	});
	it("getting user that doesnt exist:", function(done) {
		core.emit("getUsers", {ref:"harish1"}, function(err, data){
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(!data.results, "why did it give results?");
			done();			
		});
	});
	it("hasMember query:", function(done) {
		core.emit("getRooms", {hasMember:"harish"}, function(err, data){
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results[0], "empty results");
			assert.equal(data.results[0].id, "scrollback", "empty results");
			assert.equal(data.results.length, 1, "extra results returned");
			done();			
		});
	});
	it("storing room scrollbackteam2", function(done) {
		core.emit("room", {
			id: generate.uid(),
			type:"room",
			room: {
				id:"scrollbackteam2",
				description:"this is a room",
				type:"room",
				params:{}
			},
			user: {
				id:"harish",
			}
		}, function(err, data){
			assert(!err, err);
			done();
		});
	});
	it("hasMember query:", function(done) {
		core.emit("getRooms", {hasMember:"harish"}, function(err, data){
			var ids = [];
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results[0], "empty results");
			data.results.forEach(function(room) {
				ids.push(room.id);
			});
			assert(ids.indexOf("scrollback")>=0, "missing results");
			assert(ids.indexOf("scrollbackteam2")>=0, "missing results");
			assert.equal(data.results.length, 2, "extra results returned");
			done();			
		});
	});
	it.skip("hasMember query with ref:", function(done) {
		core.emit("getRooms", {hasMember:"harish", ref:"scrollback"}, function(err, data){
			var ids = [];
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results[0], "empty results");
			assert.equal(data.results[0].id, "scrollback", "empty results");
			assert.equal(data.results.length, 1, "extra results returned");
			done();			
		});
	});
});
describe("storing actions", function() {
	it("storing back message", function(done) {
		core.emit("back", {
			id: generate.uid(),
			to: "scrollback",
			from:"harish",
			session:generate.uid(),
			resource:generate.uid()
		}, function(err, data){
			if(err) throw err;
			else done();
		});
	});
	it("storing away message", function(done) {
		core.emit("away", {
			id: generate.uid(),
			to: "scrollback",
			from:"harish",
			session:generate.uid(),
			resource:generate.uid()
		}, function(err, data){
			if(err) throw err;
			else done();
		});
	});
	it("storing join message", function(done) {
		core.emit("join", {
			id: generate.uid(),
			role:"follower",
			to: "scrollbackteam",
			from:"harish",
			type:"join",
			session:generate.uid(),
			resource:generate.uid(),
			user:{id:"harish"},
			room:{id:"scrollbackteam"}
		}, function(err, data){
			if(err) throw err;
			else done();
		});
	});
	it("Checking join:", function(done) {
		core.emit("getRooms", {hasMember:"harish"}, function(err, data){
			var idRole = [];
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results.length, "empty results");
			data.results.forEach(function(room) {
				idRole[room.id] = room.role;
			});
			assert(idRole.hasOwnProperty("scrollbackteam"), "room missing in the results");
			assert.equal(idRole["scrollbackteam"], "follower", "role not set");
			done();			
		});
	});
	it("storing part message", function(done) {
		core.emit("part", {
			id: generate.uid(),
			to: "scrollbackteam",
			from:"harish",
			type:"part",
			session:generate.uid(),
			resource:generate.uid(),
			user:{id:"harish"},
			room:{id:"scrollbackteam"}
		}, function(err, data){
			if(err) throw err;
			else done();
		});
	});
	it.skip("Checking part:", function(done) {
		core.emit("getRooms", {hasMember:"harish"}, function(err, data){
			var ids = [];
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results.length, "empty results");
			data.results.forEach(function(room) {
				ids.push(room.id);
			});
			assert.equal(ids.indexOf("scrollbackteam"),-1, "still following the room");
			done();			
		});
	});
	it("storing admit message", function(done) {
		core.emit("admit", {
			id: generate.uid(),
			to: "scrollbackteam",
			from:"harish",
			type:"admit",
			ref:"amal",
			invitedRole: "follower",
			victim: {id: "amal"},
			session:generate.uid(),
			resource:generate.uid(),
			user:{id:"harish"},
			room:{id:"scrollbackteam"}
		}, function(err, data){
			if(err) throw err;
			else done();
		});
	});
	it("Checking admit:", function(done) {
		core.emit("getRooms", {hasMember:"amal"}, function(err, data){
			var idRole = {};
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results.length, "empty results");
			data.results.forEach(function(room) {
				idRole[room.id] =  room.role;
			});
			assert(idRole.hasOwnProperty("scrollbackteam"), "still following the room");
			assert.equal(idRole["scrollbackteam"],"none", "still following the room");
			done();			
		});
	});
	it("storing expel message", function(done) {
		core.emit("expel", {
			id: generate.uid(),
			to: "scrollbackteam",
			from:"harish",
			type:"expel",
			ref:"amal",
			invitedRole: "banned",
			transistionAt: new Date().getTime()+(5*60*1000),
			victim: {id: "amal", role:"follower"},
			session:generate.uid(),
			resource:generate.uid(),
			user:{id:"harish"},
			room:{id:"scrollbackteam"}
		}, function(err, data){
			if(err) throw err;
			else done();
		});
	});
	it("Checking admit:", function(done) {
		core.emit("getRooms", {hasMember:"amal"}, function(err, data){
			var idRole = {};
			assert(!err, "Error thrown");
			assert(data, "no response");
			assert(data.results.length, "empty results");
			data.results.forEach(function(room) {
				idRole[room.id] =  room;
			});
			assert(idRole.hasOwnProperty("scrollbackteam"), "still following the room");
			assert.equal(idRole["scrollbackteam"].role,"banned", "Not banned yet");
			assert.equal(idRole["scrollbackteam"].transitionRole,"follower", "Not banned yet");
			assert(idRole["scrollbackteam"].roleUntil,"no timeout");
			done();	
		});
	});
});