/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (types) {
	var room = types.rooms;
	var user = types.users;

	return{
		getUsers: function(query, cb) {		
			var gateway, eqArray = [], req={};
			if(query.result) return callback();

			if(query.memberOf) {
				req.by = "memberOf";
				req.eq = [];
				req.eq.push(query.memberOf);

				if(query.ref) req.eq.push(query.ref);

			}else if(query.ref && query.ref != 'me') {
				//getting use by ids
				return user.get(query.ref, function(err, res) {
					if(err || !res) return cb();
					query.results = [res];
					cb();
				});
			}

			if(query.identity) {
				req.by = "gatewayIdentity";

				gateway = query.identity.split(":");
				req.eq.push(gateway[0]);

				if (gateway[1]) req.eq.push(gateway[1]);
			}
			user.get(req, function(err, res) {
				query.results = res;
				cb();
			});
		},
		getRooms: function(query, cb) {
			var gateway, eqArray = [], req={};

			if(query.result) return callback();

			if(query.hasMember) {
				req.by = "hasMember";
				req.eq = [];
				req.eq.push(query.hasMember);
				if(query.ref) req.eq.push(query.ref);
			}else if(query.ref && query.ref != 'me') {

				return room.get(query.ref, function(err, res) {
					if(err || !res) return cb();
					query.results = [res];
					cb();
				});

			}else if(query.identity) {
				req.by = "gatewayIdentity";
				gateway = query.identity.split(":");
				req.eq.push(gateway[0]);
				if (gateway[1]) req.eq.push(gateway[1]);
			}else{
				return callback();
			}

			room.get(req, function(err, res) {
				query.results = res;
				cb();
			});
		},
		put: function(action, cb) {
			var type = action.type;
			
			var data = action[type];

			var createdOn, timezone;

			if(action.old) {
				createdOn = action.old.createdOn;
			}else {
				createdOn = new Date().getTime();
			}

			var newRoom = {
				id: data.id,
				description: data.description,
				createdOn: createdOn,
				type: data.type,
				picture: data.picture,
				identities: [],
				params: data.params,
			};
			
			if (data.identities) {
				newRoom.identities = data.identities
			}

			if(action.type === "user") {
				user.put(newRoom, function(err, res) {
					return cb(err);
				});
			}else {
				room.put(newRoom, function(err, res) {
					if(!data.old) {
						types.rooms.link(data.id, 'hasMember', action.user.id, {
							role: "owner",
							roleSince: new Date().getTime()
						}, function(err, res) {
							cb(err, data);
						});
					}else {
						cb(err, data);
					}
				});
			}
		}
	}
};