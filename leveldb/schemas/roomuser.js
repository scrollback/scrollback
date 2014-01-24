/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (types) {
	var room = types.rooms;
	var user = types.users;
	return{
		getUser: function(query, cb) {
			if(query.id){
				user.get({by:"id", eq:query.id}, cb);	
			}else if(query.memberOf) {
				users.get({by: 'memberOf', eq: [query.memberOf, 'role', 'memberOf']}, cb);
			}
		},
		getRoom: function(query, cb) {
			if(query.id){
				room.get({by:"id", eq:query.id}, cb);	
			}else if(query.hasMember) {
				room.get({by: 'hasMember', eq: [query.hasMember, 'role', 'hasMember']}, cb);
			}
			room.get({by:"id", eq:query.id}, cb);
		},
		put: function(data, cb) {
			if(room.type === "user") user.put(data,cb);
			else room.put(data,cb);
		}
	}
};