/* jshint node: true */
/* global it, before, describe */
var assert = require("assert");
var core = new (require("../lib/emitter.js"))();
var threader = require("./threader.js");
var gen = require("../lib/generate.js");
var guid = gen.uid;
var names = gen.names;
var message = {
	id:guid(),
	text: "values : " + Math.random(),
	from : "guest-" + names(6),
	to: "scrollback",
	type: 'text',
	time: new Date().getTime(),
	labels: {},
	threads: [],
	room: {
		id: "scrollback",
		params: {
			threader: {
				enabled: true
			}
		}
	}
};
function copyMsg() { return JSON.parse(JSON.stringify(message)); }
describe('threader', function() {
	before( function(done) {
		this.timeout(10000);
		threader(core);
		setTimeout(function(){
			done();	
		}, 9000);
	});
	it('should get a thread with title', function(done) {
		var msg = copyMsg();
		core.emit("text", msg, function(/*err, msg*/) {
			console.log("message= ", msg);
			var m = (msg.threads  && msg.threads instanceof Array && msg.threads.length) > 0 ? true : false;
            m = m && (msg.threads[0].id && msg.threads[0].score ? true : false);
			assert.equal(m, true, "Unable to get a thread for message OR typeof thread is not an array.");
			done();
		});
	});

	it('should get a thread with lables', function(done) {
		var msg = copyMsg();
		core.emit("text", msg, function(/*err, msg*/) {
			console.log("message= ", msg);
			var m = (msg.labels && msg.labels.normal && msg.labels.nonsense && msg.labels.spam) ? true : false;
			assert.equal(m, true, "Unable to get a labels");
			done();
		});
	});

    it('should Update thread ID (threader enabled)', function (done) {
		var msg = copyMsg();
		msg.threads = [{
			id: "new",
			score: 1
		}];
		core.emit("text", msg, function (/*err, msg*/) {
			console.log("message= ", msg);
			var m = (msg.threads && msg.threads instanceof Array && msg.threads.length) > 0 ? true : false;
			m = m && (msg.threads[0].id && msg.threads[0].id !== 'new' && msg.threads[0].score ? true : false);
			assert.equal(m, true, "Not updating thread ID OR typeof thread is not an array.");
			done();
		});
	});
	
	it('should Update thread ID (threader disbled)', function (done) {
		var msg = copyMsg();
		msg.room.params.threader.enabled = false;
		msg.threads = [{
			id: "new",
			score: 1
		}];
		core.emit("text", msg, function (/*err, msg*/) {
			console.log("message= ", msg);
			var m = (msg.threads && msg.threads instanceof Array && msg.threads.length) > 0 ? true : false;
			m = m && (msg.threads[0].id && msg.threads[0].id !== 'new' && msg.threads[0].score ? true : false);
			assert.equal(m, true, "Not updating thread ID OR typeof thread is not an array.");
			done();
		});
	});
	
	it('should add startOfThread label', function (done) {
		var msg = copyMsg();
		msg.room.params.threader.enabled = false;
		msg.threads = [{
			id: "new",
			score: 1
		}];
		core.emit("text", msg, function (/*err, msg*/) {
			console.log("message= ", msg);
			assert.equal(msg.labels.startOfThread, 1, "labels startOfThread is not added");
			done();
		});
	});
	
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
			assert.equal(msg.threads.length > 0, true, "No thread added to array");
			done();
		});
	});

	it('should not get threads if disabled', function(done) {
		var msg = copyMsg();
		msg.room.params.threader.enabled = false;
		core.emit("text", msg, function(/*err, data*/) {
			console.log("msg=", msg);
			assert.equal(msg.threads.length, 0, "Length of threads array is more then 0");
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
