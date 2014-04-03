var assert = require("assert");
var core = require("../test/mock-core.js")();
var gen = require("../lib/generate.js")
var search = require("./search.js")
var guid = 	gen.uid;
var names = gen.names;
var msg = {id:guid(), text: "", from : "guest-" + names(6), to: "testingRoom", type: 'text', time: new Date().getTime(), session: "web://sdjfkalja24aadf:dkaslkfjkjaf"};

describe('search', function() {
	beforeEach (function(done) {
		this.timeout(15000);
		search(core);
		setTimeout(done,1500);
	});
	
	it('index test', function(done) {
		msg.text += "Microsoft introduces Universal Windows apps ";
		core.emit("text", msg, function(err, data) {
			console.log(msg, err);
			assert.ok(!err, " indexed ");
			done();
		});
	});
	
	it('search test', function(done) {
		core.emit("getTexts", {q:'microsoft'}, function(err, data) {
			var results = data.results.hits.hits;
			var numOfResults = data.results.hits.total;
			for(var i = 0; i < numOfResults; i++){
				console.log(results[i]._source);
			}
			assert(numOfResults,4, " found "+numOfResults+" result");
			done();
		});
	});
});