var assert = require("assert");
var config  = require('../config.js');
var core = require("../test/mock-core.js")();
var email = require("./email.js");
var guid = require("../lib/guid.js");
var names = require("../lib/names.js");
var msg = {
    id: guid(),
    text: "values : " + Math.random(),
    labels: {"yint93lcua8lj1dl5wggb67iil365asw:values-:-0.2674854747019708": 1},
    from: "guest-" + names(6),
    to: "scrollback",
    type: 'text',
    time: new Date().getTime()
};

describe.only('Email test', function() {
    it('init', function(done) {
        email(core);
        setTimeout(function(){
            done();
        }, 1500);
    });
    it('should get a label with title', function(done) {
        core.emit("text", msg, function(err, data) {
            console.log(msg);
            done();
        });
    });

});

/**
 * TODO:
 *1. Email send Test
 * 2. Mentions Test.
 */ // rewrite
