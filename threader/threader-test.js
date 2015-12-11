
/* global it, before, describe */

var assert = require("assert");
var core = new (require("ebus"))();
var threader = require("./threader.js");
var gen = require("../lib/generate.js");
var config = require('./../server-config-defaults.js');
var guid = gen.uid;
var names = gen.names;
var message = {
	id:guid(),
	text: "values : " + Math.random(),
	from : "guest-" + names(6),
	to: "scrollback",
	type: 'text',
	time: new Date().getTime(),
	tags: [],
	thread: "asdfasdf",
	room: {
		id: "scrollback",
		params: {
			threader: {
				enabled: true
			}
		}
	}
};
function copyMsg() { "use strict"; return JSON.parse(JSON.stringify(message)); }
function isEmpty(str) {
	"use strict";
    return (!str || 0 === str.length);
}
describe('threader', function() {
	"use strict";
	before( function(done) {
		this.timeout(10000);
		threader(core, config.threader);
		setTimeout(function(){
			done();	
		}, 9000);
	});
	it('should have a thread of type "string"', function(done) {
		var msg = copyMsg();
		core.emit("text", msg, function(/*err, msg*/) {
			console.log("message= ", msg);
			var m = (msg.thread  && typeof msg.thread === 'string')? true : false;
			assert.equal(m, true, "Unable to get a thread for message OR typeof thread is not a string.");
			done();
		});
		//done();
	});

	/*it('should get a thread with lables', function(done) {
		var msg = copyMsg();
		core.emit("text", msg, function(err, msg) {
			console.log("message= ", msg);
			var m = (msg.labels && msg.labels.normal && msg.labels.nonsense && msg.labels.spam) ? true : false;
			assert.equal(m, true, "Unable to get a labels");
			done();
		});
	});*/

	it('should not take more then 1 sec', function(done) {
		this.timeout(1100);
		var msg = copyMsg();
		msg.threads = [];
		core.emit("text", msg, function(/*err, data*/) {
			console.log(msg);
			done();
		});
	});

	it('should get threads if threader params is not defined', function(done) {
		var msg = copyMsg();
		delete msg.room.params.threader;
		core.emit("text", msg, function(/*err, data*/) {
			console.log("msg=", msg);
			var m = (msg.thread)? true : false;
			assert.equal(m, true, "No thread added to array");
			done();
		});
	});

	it('should not get threads if disabled', function(done) {
		var msg = copyMsg();
		msg.room.params.threader.enabled = false;
		core.emit("text", msg, function(/*err, data*/) {
			console.log("msg=", msg);
			assert.equal(isEmpty(msg.thread), true, "Got a thread on disable");
			done();
		});
	});

	it('Invalid threader params', function(done) {
		var msg = copyMsg();
		var room = msg.room;
		room.params.threader = "hello"; // invalid value
		core.emit("room", {room: room}, function(err/* data*/) {
			console.log("msg=", room, err);
			assert.equal(!!err, true, "Should throw error");
			done();
		});
	});

	it('valid threader params', function(done) {
		var msg = copyMsg();
		var room = msg.room;
		core.emit("room", {room : room}, function(err/*, data*/) {
			console.log("msg=", room, err);
			assert.equal(!err, true, "Should throw error");
			done();
		});
	});

});
