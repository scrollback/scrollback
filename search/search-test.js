/*global describe, before, it*/
var assert = require("assert");
var core = require("../test/mock-core.js")();
var gen = require("../lib/generate.js");
var search = require("./search.js");
var config = require("../server-config-defaults.js");
var guid = gen.uid;
var names = gen.names;
var msg = {
    id: guid(),
    text: "",
    from: "guest-" + names(6),
    to: "testingRoom",
    type: 'text',
    time: new Date().getTime(),
    session: "web://sdjfkalja24aadf:dkaslkfjkjaf",
    threads : [{ id: "cdl7c9bnwm6skztk1d7c0vfzr461scni", title: "will get a microsoft", score: 0.53}, {id: "wbyj9i7q0oh26ibae6b5eqxqwx41gjbp", title: "search for an apple", score: 0.93}]
};

var subjects = ['I', 'You', 'Kamal', 'Harish', 'Bob', 'John', 'Sue', 'Kate', 'The lizard people'];
var verbs = ['will search for', 'will get', 'will find', 'attained', 'found', 'will start interacting with', 'will accept', 'accepted'];
var objects = ['Billy', 'an apple', 'a microsoft', 'a Triforce', 'the treasure', 'a sheet of paper'];
var endings = ['.', ', right?', '.', ', like I said.', '.', ', just like your momma!'];

var randomSentence = subjects[Math.round(Math.random() * (subjects.length - 1))] + ' ' + verbs[Math.round(Math.random() * (verbs.length - 1))] + ' ' + objects[Math.round(Math.random() * (objects.length - 1))] + endings[Math.round(Math.random() * (endings.length - 1))];

var room = {
    id: names(3) + names(5),
    description: "",
    type: 'room'
};

describe('search', function () {
    before(function (done) {
        search(core, config.search);
        this.timeout(15000);
        done();
    });

    it('text index test', function (done) {
        msg.text = randomSentence;
        core.emit("text", msg, function (err, data) {
            
            assert.ok(!err, " indexed ");
            assert.ok(data, " no data ");
            done();
        });
    });
    
    it('room index test', function (done) {
        //this.timeout(10000);
        room.description = randomSentence;
        core.emit("room", room, vik);        
        function vik (err, data) {
            if(err){console.log(err);}
            assert.ok(!err, " indexed ");
            assert.ok(data, " no data ");
            done();
        }
    });

    
    it('text search test', function (done) {
        core.emit("getTexts", {
            q: 'microsoft'
        }, function (err, data) {
            var results = data.results;
            //console.log(results);
            var numOfResults = data.results.length;
            for (var i = 0; i < numOfResults; i++) {
                console.log(results[i]._source);
            }
            assert(numOfResults, 4, " found " + numOfResults + " result");
            done();
        });
    });
    
    it('room search test', function (done) {
        core.emit("getRooms", {
            q: 'apple'
        }, function (err, data) {
            var results = data.results;
            //console.log(results);
            var numOfResults = data.results.length;
            for (var i = 0; i < numOfResults; i++) {
                console.log(results[i]._source);
            }
            assert(numOfResults, 2, " found " + numOfResults + " result");
            done();
        });
    });

 /*   it('threads search test', function (done) {
        core.emit("getThreads", {
            q: 'microsoft'
        }, function (err, data) {
            var results = data.results;
            var numOfResults = data.results.length;
            for (var i = 0; i < numOfResults; i++) {
                console.log(results[i]);
            }
            assert(numOfResults, 2, " found " + numOfResults + " result");
            done();
        });
    });*/
    
    it('threads search test', function (done) {
        core.emit("getThreads", {
            q: 'apple',
            afterThis: 1397114342685
        }, function (err, data) {
            var results = data.results;
            var numOfResults = data.results.length;
            for (var i = 0; i < numOfResults; i++) {
                console.log(results[i]);
            }
            assert(numOfResults, 2, " found " + numOfResults + " result");
            done();
        });
    });
});