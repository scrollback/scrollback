module.exports = function(config) {
	var sessionDB = require('redis').createClient();
	sessionDB.select(config.sessionDB);
	var userDB = require('redis').createClient();
	userDB.select(config.userDB);
	var roomDB = require('redis').createClient();
	roomDB.select(config.roomDB);
	var dataBases = {
		session: sessionDB,
		user: userDB,
		room: roomDB
	};
	function put (type, id, data, callback) {
		dataBases[type].set(type + ":{{" + id + "}}", JSON.stringify(data), function(err, data) {
			if (err && callback) return callback(err, null);
			if (!err && callback) callback(null, data);
		});
	}
	
	return put;
};
