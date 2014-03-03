var assert = require("assert");
var config  = require('../../config.js');
var core = require("../../test/mock-core.js")();
var loginrequired = require("./loginrequired.js");
var guid = require("../../lib/guid.js");
var names = require("../../lib/names.js");
var msg = {id:guid(), text: "values : " + Math.random(), from : "guest-" + names(6), to: "scrollback", type: 'text', time: new Date().getTime()};



describe('Login Required', function() {
    it('init', function(done) {
        loginrequired(core);
        setTimeout(function(){
            done();
        }, 1500);
    });
    it('Username ban test.', function(done) {
        core.on("getRooms", function(query, callback){
            query.result = [{id: "scrollback",  description: "this is a awesome room", type: "room", params:{ loginrequired: true}}];
            callback();
        }) ;
        core.emit("text", msg, function(err, data) {
            console.log(msg, err);
            assert(err, new Error("AUTH_REQ_TO_POST"), "Login required not working....");
            done();
        });
    });

    it('Session Test.', function(done) {
        msg.session = "twitter://test:test";
        core.emit("text", msg, function(err, data) {
            console.log(msg, err);
            assert.ifError(err, "Banning twitter messages also");
            done();
        });
    });


});
