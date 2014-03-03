var assert = require("assert");
var config  = require('../../config.js');
var core = require("../../test/mock-core.js")();
var roomauth = require("./roomauth.js");
var guid = require("../../lib/guid.js");
var names = require("../../lib/names.js");
var roomAction = {
    id : guid(),
    from: "testUser",
    to: "scrollback",
    time: new Date().getTime(),
    room: {
        id: "scrollback",
        description: "this is a awesome room",
        type: "user",
        params: {
            loginrequired: true
        }

    },
    user: {
        id: "testUser",
        type: "user"
    }
}


describe('roomauth', function() {
    it('init', function(done) {
        roomauth(core);
        setTimeout(function(){
            done();
        }, 1500);
    });
    it('Room auth test.', function(done) {
        core.on('getUsers', function(query, callback) {
           if(query && query.memberOf === 'scrollback' && query.role === 'owner') {
                query.results = [{id: "testUser2", type: "user"}, {id: "testUser3", type: "user"}];
                callback();
            }
        });
        core.emit("room", roomAction, function(err, data) {
            console.log(err);
            assert(err, new Error("ROOM_AUTH_FAIL"), "old owner and new owners are not same.");
            done();
        });


    });
    it('Test with actual Owner', function(done){
        roomAction.from = "testUser2";
        core.emit("room", roomAction, function(err, data) {
            console.log(err);
            assert.ifError(err, "Throwing Error for actual Owner.");
            done();
        });
    });

});