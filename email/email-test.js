/* eslint-env mocha */
var config  = require('../server-config-defaults.js');
var core = require("../test/mock-core.js")();
var email = require("./email.js")(config.email);
var gen = require("../lib/generate.js");
var guid = 	gen.uid;
var names = gen.names;
var msg = {
    id: guid(),
    text: "values : " + Math.random(),
    threads: [{title : "values-:-0.2674854747019708" , id: "yint93lcua8lj1dl5wggb67iil365asw" , score : 1}],
    from: "guest-" + names(6),
    to: "scrollback",
    type: 'text',
    time: new Date().getTime()
};

describe('Email test', function() {
	beforeEach(function(done) {
        email(core);
        setTimeout(function(){
            done();
        }, 1500);
    });
    it('add message test', function(done) {
        this.timeout(30000);
		core.emit("text", msg, function() {
            console.log(msg);
            setTimeout(function() {done();}, 15000);
        });
    });

});

/**
 * TODO:
 *1. Email send Test
 * 2. Mentions Test.
 */ // rewrite
