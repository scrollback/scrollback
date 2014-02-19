var objectlevel = require("objectlevel");
var config = require("../../config.js");


module.exports = function(db) {
	var texts = require("./text-type.js")(db);
	var rooms = require("./room-type.js")(db);
	var users = require("./user-type.js")(db);
	var labels = require("./label-type.js")(db);
	var joinpart = require("./join-part-type.js")(db);
	var admitexpel = require("./admit-expel-type.js")(db);
	var awayback = require("./away-back-type.js")(db);
	var edit = require("./edit-type.js")(db);

	db.defineLink({"hasMember":users, "memberOf": rooms}, {
		indexes: {
			roleTime: function(data, emit) {
				emit(data.role,data.time);
			},
		}
	});
	
	db.defineLink({"hasLabel":labels, "belongsTo": texts}, {
		indexes: {
			time: function(data, emit) {
				emit(data.time);
			}
		}
	});

	db.defineLink({"hasOccupant":users, "occupantOf": rooms}, {
		indexes: {
			time: function(data, emit) {
				emit(data.time);
			}
		}
	});

	return {
		texts: texts,
		rooms: rooms,
		users: users,
		labels: labels,
		joinpart: joinpart,
		admitexpel: admitexpel,
		awayback: awayback,
		edit: edit
	};
};