var config = require("../config.js");
var dataBases = {
	session: require('../lib/redisProxy.js').select(config.redisDB.session),
	user: require('../lib/redisProxy.js').select(config.redisDB.user),
	room: require('../lib/redisProxy.js').select(config.redisDB.room)
};
module.exports = function(type,id, callback) {
	console.log();
	dataBases[type].get(type+":{{"+id+"}}", function(err, data) {
		var res;
		if(data){
			try{
				res = JSON.parse(data);
			}
			catch(e){
				/*might be a good idea to delete something when we cant parse it.
				its never useful. unless we want it for debugging.
				But now we done have any way of actually knowing when something goes bad. so i am deleting it.*/
				dataBases[type].del(type+":{{"+id+"}}");
			}
		}
		callback && callback(err, res);
	});
};