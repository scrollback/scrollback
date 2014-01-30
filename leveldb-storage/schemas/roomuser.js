/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (types) {
	var room = types.rooms;
	var user = types.users;

	return{
		getUser: function(query, cb) {			
			if(query.id){
				user.get(query.id, function(err, res) {
					cb(true, res);
				});	
			}else if(query.memberOf) {
				user.get({by: 'memberOf', eq: [query.memberOf, 'roleTime', 'member']}, function(err, res){
					cb(true, res);
				});
			}else if(query.occupantOf) {
				user.get({by: 'occupantOf', eq: query.occupantOf}, function(err, res){
					cb(true, res);
				});
			}
		},
		getRoom: function(query, cb) {
			if(query.id){
				room.get(query.id, function(err, res){
					log(err, res);
					cb(true, res);
				});	
			}else if(query.hasMember) {
				room.get({by: 'hasMember', eq: [query.hasMember, 'roleTime', 'member']}, function(err, res){
					cb(true, res);
				});
			}else if(query.hasOccupant) {
				room.get({by: 'hasOccupant', eq: query.hasOccupant}, function(err, res){
					cb(true, res);
				});
			}
		},
		put: function(data, cb) {
			if(data.type === "user"){
				user.put(data, function(err, res) {
					cb(err, data);
				});	
			} 
			else room.put(data, function(err, res) {
				cb(err, data);
			});
		}
	}
};