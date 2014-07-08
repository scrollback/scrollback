var redis = require("redis");
var generic_pool = require("generic-pool").Pool({
    name: "redis pool",
    max: 50,
    create: function(callback) {
        var x = redis.createClient();
        callback(null, x);
    },
    destroy: function(redisClient) {
        redisClient.quit();
    }
});

function createProxy() {
    var prop;
    var dc = redis.createClient(), proxy = {};
    for(prop in dc) {
        (function(prop){
            proxy[prop] = function() {
                var args = [].splice.call(arguments,0);
                generic_pool.acquire(function(err, client) {
                    var cb = typeof args[args.length-1] === 'function'? args.pop(): null;
                    if(proxy._dbnum) client.select(proxy._dbnum);

                    if(prop == 'multi') {
                        var multi = client[prop].apply(client, args),
                            exec = multi.exec;

                        multi.exec = function(cb2) {
                            exec.call(multi, function() {
                                generic_pool.release(client);
                                cb2.apply(null, arguments);
                            });
                        }
                        cb(multi);
                    }

                    args.push(function() {
                        generic_pool.release(client);
                        if(cb) cb.apply(null, arguments);
                    });
                    client[prop].apply(client, args);
                });
            }
        })(prop);
    }
    dc.quit();
    return proxy;
};

var proxy = createProxy();

proxy.select = function(db) {
    var p = createProxy();
    p._dbnum = db;
    return p;
};

module.exports = proxy;
