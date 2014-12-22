
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

	return function(type, id, callback) {
		dataBases[type].get(type + ":{{" + id + "}}", function(err, data) {
			var res;
			if (data) {
				try {
					res = JSON.parse(data);
				} catch (e) {
					/*might be a good idea to delete something when we cant parse it.
					its never useful. unless we want it for debugging.
					But now we done have any way of actually knowing when something goes bad. so i am deleting it.*/
					dataBases[type].del(type + ":{{" + id + "}}");
				}
			}
			if(callback) callback(err, res);
		});
	};
};