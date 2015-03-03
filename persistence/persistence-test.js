/* global localStorage, window, it */

localStorage = {};
window = {localStorage: localStorage};

var assert = require("assert"),
	core = new (require("ebus"))(),
	store = require("../store/store.js")(core),
	persistence = require("./persistence-client.js");

persistence(core, {}, store);

core.on('statechange', function(changes, next) { 
	console.log('State changed');
	next(); 
}, 1);

it('should store new entities', function(done) {
	core.emit('setstate', {entities: {'room1': {id: 'room1', picture: 'hello'}}});
	done();
});

it('should load blank', function (done) {
	core.emit('boot', {session: 'asdf'}, function (err, data) {
		console.log('Return value is', err, data);
		done();
	});
});
