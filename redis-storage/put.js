var config = require("../config.js");
var dataBases = {
	session: require('../lib/redisProxy.js').select(config.redisDB.session),
	user: require('../lib/redisProxy.js').select(config.redisDB.user),
	room: require('../lib/redisProxy.js').select(config.redisDB.room)
};
module.exports = function(type,id,data, callback) {
	dataBases[type].set(type+":{{"+id+"}}",JSON.stringify(data), function(err, data) {
		if(err && callback)	return callback(err, null);
		if(!err && callback) callback(null, data);
	});
};