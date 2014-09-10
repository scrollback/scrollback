/* global module, require */
var log = require("../../lib/logger.js");
var config = require('../../config.js');
var internalSessions = Object.keys(config.whitelists);
var su = config.su;
var user, room, types;
module.exports = function (t) {
	types = t;
    room = types.rooms;
    user = types.users;

    return {
        getUsers: function (query, cb) {
            var gateway, req = {};
            if (query.results) return cb();
            if (query.ref && query.ref == 'me') return cb();
            if (query.memberOf) {
                req.by = "memberOf";
                req.eq = [];
                req.eq.push(query.memberOf);
				req.map = function (element, push) {
					if (element.role == "none") return false;
					else push(element);
				};
                if (query.ref) req.eq.push(query.ref);

            } else if (query.ref) {
				return getByIds("users", query, cb);
            } else if (query.identity) {
                req.by = "gatewayIdentity";
                req.eq = [];
                gateway = query.identity.split(":");
                req.eq.push(gateway[0]);
                if (gateway[1]) req.eq.push(gateway[1]);
            } else if (query.timezone) {
                req.by = "timezone";
                req.gte = [query.timezone.gte];
                req.lte = [query.timezone.lte];
            }
            user.get(req, function (err, res) {
                query.results = res;
                cb();
            });
        },
        getRooms: function (query, cb) {
            var gateway, req = {};
            if (query.results) return cb();
            req.eq = [];
            if (query.hasMember) {
                req.by = "hasMember";

                req.eq.push(query.hasMember);
                req.map = function (element, push) {
                    if (element.role == "none") return false;
                    else push(element);
                };
                if (query.ref) req.eq.push(query.ref);
            } else if (query.ref) {
				return getByIds("rooms", query, cb);
            } else if (query.identity) {
                req.by = "gatewayIdentity";
                gateway = query.identity.split(":");
                req.eq.push(gateway[0]);
                if (gateway[1]) req.eq.push(gateway[1]);
            } else {
                return cb();
            }

            room.get(req, function (err, res) {
                query.results = res;
                cb();
            });
        },
        put: function (action, cb) {
            var i, type = action.type,
                data = action[type],
                createTime;

            if (action.old) {
                createTime = action.old.createTime;
            } else {
                createTime = new Date().getTime();
            }

            var newRoom = {
                id: data.id,
                description: data.description,
                createTime: createTime,
                type: data.type,
                picture: data.picture,
                identities: [],
                params: {},
                guides: {}
            };

            for (i in data.guides) {
                if (data.guides.hasOwnProperty(i)) {
                    newRoom.guides[i] = data.guides[i];
                }
            }

            for (i in data.params) {
                if (data.params.hasOwnProperty(i)) {
                    newRoom.params[i] = data.params[i];
                }
            }
            if (data.identities) {
                newRoom.identities = data.identities;
            }
            if (action.type === "user") {
                data.timezone = (newRoom.timezone = data.timezone ? data.timezone : 0);
                user.put(newRoom, function (err) {
                    return cb(err);
                });
            } else {
                room.put(newRoom, function (err /*, res*/ ) {
                    if (!action.old || !action.old.id) {
                        if (internalSessions.indexOf(action.session) !== -1 || su[action.user.id]) { //if user is a super user do not create links
                            return cb();
                        }
                        types.rooms.link(data.id, 'hasMember', action.user.id, {
                            role: "owner",
                            roleSince: new Date().getTime()
                        }, function (err) {
                            cb(err);
                        });

                    } else {
                        log(err);
                        cb(err);
                    }
                });
            }
        }
    };
};

function getByIds(type, query, cb) {
	var ids;
	
	ids = (typeof query.ref == "string") ? [query.ref] : query.ref;

	function done(err, data) {
		if (err) return cb();
		if(typeof query.ref == "string") {
			if(!data || !data[0]) return cb();
		}
		query.results = data;
		cb();
	}
	multiGet(type, ids, done);
}

function multiGet(type, ids, callback) {
	var count = 0,
		length = ids.length,
		results = {},
		resp = [],
		i, errorThrown = false;

	function done(err, data) {
		var i;
		if (errorThrown) return;
		count++;
		if (err) {
			errorThrown = true;
			return callback(err);
		}

		if (!err && data) {
			results[data.id] = data;
		}
		if (count == length) {
			ids.forEach(function(id) {
				if(results[id]) resp.push(results[id]);
				else resp.push(null);
			});
			return callback(null, resp);
		}
	}

	for (i = 0; i < length; i++) {
		types[type].get(ids[i], done);
	}
}