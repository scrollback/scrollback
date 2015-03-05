/* global localStorage, window, it */

localStorage = {};
window = {localStorage: localStorage};

var assert = require("assert"),
	core = new (require("ebus"))(),
	store = require("../store/store.js")(core),
	persistence = require("./persistence-client.js"),
	doneCallback;

persistence(core, {}, store);

core.on('statechange', function(changes, next) { 
	console.log('State changed', localStorage);
	next();
	if(doneCallback) doneCallback();
}, 1);

it('should load blank', function (done) {
	core.emit('boot', {session: 'asdf'}, function (err, data) {
		console.log('boot completed: Return value is', err, data);
		done();
	});
});

it('should store new entities', function(done) {
	doneCallback = done;
	core.emit('setstate', {session: 'asdf', entities: {'room1': {id: 'room1', picture: 'hello://sdf.coj.'}}});
});

it('should store new texts and threads', function(done) {
	doneCallback = done;
	core.emit('setstate', {session: 'asdf', entities: {'room1': {id: 'room1', picture: 'hello://sdf.coj.'}}});
});
