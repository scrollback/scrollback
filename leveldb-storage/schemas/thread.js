var types;
module.exports = function (t) {
    types = t;
    return {
        put: function (data, cb) {
            var thread = {
                id: data.id,
                to: data.to,
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime
            };
            types.threads.put(thread);
            if (cb) cb();
        },
        get: function (query, callback) {
            var dbQuery = {};
            if (query.results) return callback();
            if (typeof query.ref == "string") {
                return types.threads.get(query.ref, function (err, thread) {
                    if (err || !thread) return callback();
                    query.results = [thread];
                    return callback();
                });
            } else if (query.ref) {
                return fetchThreads(query, callback);
            }

            dbQuery.by = "tostartend";
            dbQuery.gte = [];
            dbQuery.lte = [];
            dbQuery.gte.push(query.to);
            dbQuery.lte.push(query.to);
            dbQuery.limit = 256;

            if (query.time !== 0 && query.time) {
                if (query.after) {
                    dbQuery.gte.push(query.time);
                    if (query.after <= dbQuery.limit) dbQuery.limit = query.after;
                } else if (query.before) {
                    dbQuery.lte.push(query.time);
                    if (query.before <= dbQuery.limit) dbQuery.limit = query.before;
                }
            } else {
                if (query.after) {
                    query.results = [];
                    return callback();
                } else if (query.before) {
                    dbQuery.lte.push(0xffffffffffffffff);
                    if (query.before < dbQuery.limit) dbQuery.limit = query.before;
                }
            }
            if (query.before) {
                dbQuery.reverse = true;
            }
            console.log(dbQuery);
            types.threads.get(dbQuery, function (err, results) {
                if (err || !results) {
                    return callback();
                }
                if (dbQuery.reverse) results = results.reverse();
                query.results = results;
                return callback();
            });
        }
    };
};

function fetchThreads(query, cb) {
    var callbackCount = 0,
        idCount = query.ref.length,
        results = [];

    query.ref.forEach(function (id) {
        types.threads.get(id, function (err, t) {
            if (!err && t) {
                results.push(t);
            }

            callbackCount++;
            if (callbackCount == idCount) {
                query.results = results;
                cb();
            }
        });
    });
}