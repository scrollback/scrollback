var crypto = require('crypto');
var redisProxy = require('../lib/redisProxy.js');
var names = require('../lib/names.js');
var core;
module.exports = function(c) {
	core = c;
	core.on('init', function(data, callback) {
		var userObj;
		userObj = {
			createdOn: new Date().getTime(),
			type:"user",
			session:"",
			params:{},
			timezone:0,
			session: data.session || ""
		};
		// a temp thing for web gateway.
		if(data.from) {
			core.emit('getUsers',{id: data.from}, function(err, res){
				var picture;
				if(err || res.length<1){
					userObj.picture = generatePick(data.from);
					userObj.id = data.from;
					storeUser(userObj, function(err, userObj) {
						data.user = userObj;
						callback();
					});
				}else {
					data.user = res[0];
					callback();
				}
			});
		}else {
			if(data.suggestedNick) {
				generateNick(data.suggestedNick, function(possibleNick) {
					var picture;
					userObj.id = possibleNick;
					userObj.picture = generatePick(possibleNick);
					data.user = userObj;
					storeUser(userObj, function(err, res){
						callback(err);
					});
				});
			}else {
				callback();
			}
		}
	},"initializer");
};

function storeUser(user, callback) {
	redisProxy.set("user:{{"+user.id+"}}", JSON.stringify(user), function(err, res) {
		if(err) return callback(err);
		callback(null, user);
	});
	redisProxy.expire("user:{{"+user.id+"}}", 24*60*60);
}
function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=identicon&s=48';
}

function generateNick(suggestedNick, callback) {
	if(!suggestedNick) return callback(names(6));
	function getFromRedis(suggestedNick, attemptC ,callback) {
		var trying = suggestedNick;
		if(attemptC) trying+=attemptC;
		if(attemptC>=3) return callback(names(6));
		core.emit('getUsers', {id:trying},function(err, data) {
			if(data.length >0) return getFromRedis(suggestedNick, attemptC+1, callback);
			core.emit('getRooms', {id:trying},function(err, data) {
				if(data.length >0) return getFromRedis(suggestedNick, attemptC+1, callback);
				callback('guest-'+trying);
			});
		})
	}
	getFromRedis(suggestedNick, 0, callback);
}