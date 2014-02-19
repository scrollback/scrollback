/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (types) {
	var room = types.rooms;
	var user = types.users;

	return{
		getUser: function(query, cb) {			
			if(query.id){
				user.get(query.id, function(err, res) {
					if(!res) return cb(true, []);
					cb(true, [res]);
				});	
			}else if(query.memberOf) {
				user.get({by: 'memberOf', eq: [query.memberOf]}, function(err, res){
					cb(true, res);
				});
			}else if(query.occupantOf) {
				cb();
			}
		},
		getRoom: function(query, cb) {
			var gateway, eqArray = [];
			if(query.id){
				room.get(query.id, function(err, res){
					if(!res) return cb(true, []);
					cb(true, [res]);
				});	
			}else if(query.hasMember) {
				room.get({by: 'hasMember', eq: [query.hasMember]}, function(err, res){
					cb(true, res);
				});
			}else if(query.hasOccupant) {
				cb();
			}else if (query.identities) {
				gateway = query.identities.split(":");
				eqArray.push(gateway[0]);
				if (gateway[1]) {
					eqArray.push(gateway[1]);
				}
				room.get({by: 'gatewayIdentity', eq: eqArray}, function(err, res){
					cb(true, res);
				});
			}
		},
		put: function(data, cb) {
			var owner = data.owner, createdOn;
			var currentTime = new Date().getTime();
			if(data.old){
				createdOn = data.old.createdOn;
			}else{
				createdOn = new Date().getTime();
			}
			var newRoom = {
				id: data.id,
				description: data.description,
				createdOn: createdOn,
				type: data.type,
				picture: data.picture,
				timezone:0,
				identities: [],
				params: data.params,
				accounts: data.accounts
			}
			
			if (data.identities) {
				newRoom.identities = data.identities
			}else{
				data.accounts && data.accounts.forEach(function(account) {
					newRoom.identities.push(account.id);
				});
			}
			if(data.type === "user") {
				user.put(newRoom, function(err, res) {
					cb(err, data);
				});	
			} 
			else room.put(newRoom, function(err, res) {
				if(!data.old) {
					types.rooms.link(data.id, 'hasMember', owner, {
						role: "owner",
						time: new Date().getTime()
					}, function(err, res) {
						cb(err, data);
					});
				}else {
					cb(err, data);
				}
			});
		}
	}
};