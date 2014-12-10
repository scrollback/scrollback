module.exports = function(config) {
	var dataBases = {
		session: require('../lib/redisProxy.js').select(config.session),
		user: require('../lib/redisProxy.js').select(config.user),
		room: require('../lib/redisProxy.js').select(config.room)
	};
		
	function put (type, id, data, callback) {
		dataBases[type].set(type + ":{{" + id + "}}", JSON.stringify(data), function(err, data) {
			if (err && callback) return callback(err, null);
			if (!err && callback) callback(null, data);
		});
	}
	
	return put;
};
