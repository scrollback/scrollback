/* global describe, it*/

"use strict";
var assert = require("assert");
var ebus = require("ebus");
var core = new ebus();
var config = require("../server-config-defaults.js");
require("../test/mock-storage.js")(core);
require("./entityloader.js")(core, config.entityloader);
var gen = require("../lib/generate.js");
var guid = gen.uid;
//var names = gen.names;

/*****************************************************************************
This file perform tests on the entity loader plugin.
entity loader loads the data required for the action to continue.
for text|back|away|join|part|edit actions:
	should load the user and room object into user and room property of the payload 
	using the from as userid and to as roomid.
for edit
	should load the old message object into old property using ref as the messageid.
	throw err if the message object for the specified message id is not found.
for room|user
	load the old property 
*****************************************************************************/

describe('EntityLoader', function() {


	it('TEXT : should load user and room from storage object', function(done) {
		core.emit("text", {
			id: guid(),
			type:"text",
			from: "harish",
			to: "scrollback",
			text: "hi there how are you?",
			session: "web:session1"
		}, function(err, data) {
			console.log(err, data);
			assert(!err, "threw an error when it shouldnt.");
			assert(data.user.id === "harish", "User object loaded incorrectly");
			assert(data.room.id === "scrollback", "Room object loaded incorrectly");
			done();
		});
	});

	it('EDIT : should load user and room from storage object', function(done){
		core.emit("edit", {
			id: guid(),
			ref:"kdflhjsdhj",
			tags:["hidden"],
			type:"edit",
			from:"harish",
			to:"scrollback",
			session:"web:session1"
		}, function(err, data) {
			assert(!err, "threw an error when it shouldnt.");
			assert(data.user.id === "harish", "User object loaded incorrectly");
			assert(data.room.id === "scrollback", "Room object loaded incorrectly");
			done();
		});
	});

	it('JOIN : should load user and room from storage object', function(done){
		core.emit("join",{
			id:guid(),
			from:"harish",
			session:"web:session1",
			to: "scrollback",
			type: "join"
		}, function(err, data) {
			assert(!err, "threw an error when it shouldnt.");
			assert(data.user.id === "harish", "User object loaded incorrectly");
			assert(data.room.id === "scrollback", "Room object loaded incorrectly");
			done();
		});
	});

	it('PART : should load user and room from storage object', function(done){
		core.emit("part",{
			id:guid(),
			from:"harish",
			session:"web:session1",
			to: "scrollback",
			type: "part"
		}, function(err, data) {
			assert(!err, "threw an error when it shouldnt.");
			assert(data.user.id === "harish", "User object loaded incorrectly");
			assert(data.room.id === "scrollback", "Room object loaded incorrectly");
			done();
		});
	});

	it('AWAY : should load user and room from storage object', function(done){
		core.emit("away",{
			id:guid(),
			from:"harish",
			session:"web:session1",
			to: "scrollback",
			type: "away"
		}, function(err, data) {
			assert(!err, "threw an error when it shouldnt.");
			assert(data.user.id === "harish", "User object loaded incorrectly");
			assert(data.room.id === "scrollback", "Room object loaded incorrectly");
			done();
		});
	});

	it('BACK : should load user and room from storage object', function(done){
		core.emit("back",{
			id:guid(),
			from:"harish",
			session:"web:session1",
			to: "scrollback",
			type: "back"
		}, function(err, data) {
			assert(!err, "threw an error when it shouldnt.");
			assert(data.user.id === "harish", "User object loaded incorrectly");
			assert(data.room.id === "scrollback", "Room object loaded incorrectly");
			done();
		});
	});

	it('ADMIT : should load user and room from storage object', function(done){
		core.emit("admit",{
			id:guid(),
			from:"harish",
			ref:"harish",
			session:"web:session1",
			to: "scrollback",
			type: "admit"
		}, function(err, data) {
			assert(!err, "threw an error when it shouldnt.");
			assert(data.user.id === "harish", "User object loaded incorrectly");
			assert(data.room.id === "scrollback", "Room object loaded incorrectly");
			assert(data.victim.id === "harish", "victim is not loaded correctly");
			done();
		});
	});

	it('EXPEL : should load user and room from storage object', function(done){
		core.emit("expel",{
			id:guid(),
			from:"harish",
			ref:"harish",
			session:"web:session1",
			to: "scrollback",
			type: "expel"
		}, function(err, data) {
			assert(!err, "threw an error when it shouldnt.");
			assert(data.user.id === "harish", "User object loaded incorrectly");
			assert(data.room.id === "scrollback", "Room object loaded incorrectly");
			assert(data.victim.id === "harish", "victim is not loaded correctly");
			done();
		});
	});

	it("GETTHREADS : should load thread from storage object", function(done) {
		core.emit("getThreads",{
			id:"dskjf34jkwebfjfdh",
			type:"getThreads",
			from:"harish",
			to:"scrollback",
			session:"web:session1"
		},function(err, data){
			console.log(data);
			assert(!err, "threw an erron when it shouldnt");
			assert(data.results[0].id ==="dskjf34jkwebfjfdh","thread is not loading from the mock storage");
			done();
		});
	});

	it("GETTEXTS : should load texts from storage object", function(done){
		core.emit("getTexts",{
			id:"kdflhjsdhj",
			type:"getTexts",
			from:"harish",
			to:"scrollback",
			session:"web:session1"
		}, function(err, data){
			assert(!err, "threw an error when it shouldnt");
			assert(data.results, "should load text object");
			done();
		});
	});
})