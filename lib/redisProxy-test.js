var assert = require("assert");
var redis = require('./redisProxy.js').select(1);
var redis1 = require('./redisProxy.js').select(2);

describe('redisProxy', function() {
    it('Mutli Test', function(done) {
        redis.multi(function(multi) {
            var a = Math.random();
            var b = Math.random();
            multi.set("test:value1",a );
            multi.set("test:value2",b);
            multi.exec(function(err, reply) {
                redis.multi(function(multi) {
                    multi.get("test:value1");
                    multi.get("test:value2");
                    multi.exec(function(err, reply) {
                        console.log("Returned values from redis", "err,", err, "reply", reply);
                        assert.deepEqual( reply, [ "" + a,"" + b], "Values that redis is setting are incorrect.");
                        redis.multi(function(multi) {
                            multi.del("test:value1");
                            multi.del("test:value2");
                            multi.exec(function(err, r) {
                                console.log("Returned values from redis", "err,", err, "reply", r);
                                assert.deepEqual(r, [1, 1],  "Unable to delete values.");
                                done();
                            });
                        });
                    })

                });

            });
        });
    });

    it('Data storage Test', function(done) {
        var a = Math.random();
        redis.set("test:v1", a, function(err, r ) {
            assert.equal(r, 'OK', "Unable to set value");
            redis.get("test:v1", function(err, reply) {
                assert(reply, a, "Unable to get Value");
                redis.del("test:v1", function(err, r) {
                    assert(r, 1, "Unable to Delete value");
                    done();
                });
            });
        });
    });

    it('Database Select Test', function(done) {
        var a = Math.random();
        redis1.set("test:v2", a, function(err, r ) {
            assert.equal(r, 'OK', "Unable to set value");
            redis1.get("test:v2", function(err, reply) {
                assert(reply, a, "Unable to get Value");
                redis1.del("test:v2", function(err, r) {
                    assert(r, 1, "Unable to Delete");
                    done();
                });
            });
        });
    });

});