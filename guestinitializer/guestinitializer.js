var crypto = require('crypto');
var redisProxy = require('../lib/redisProxy.js');
module.exports = function(core) {
	core.on('init', function(data, callback) {
		var userObj;
		redisProxy.get("user:{{"+data.from+"}}", function(err, res) {
			var picture = 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(data.from).digest('hex') + '/?d=identicon&s=48';
			if(!res) {
				userObj = {
					id: data.from,
					createdOn: new Date().getTime(),
					type:"user",
					picture: picture,
					session:"",
					params:{},
					timezone:0
				};
				redisProxy.set("user:{{"+userObj.id+"}}", JSON.stringify(userObj), function(err, data){
					callback();
				});
			}
			else {
				callback()
			}
		});
	},"storage");
};