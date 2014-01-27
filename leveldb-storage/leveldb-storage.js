var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
module.exports = function(core) {
	var db = new objectlevel(__dirname+"/"+config.leveldb.path);
	var types = require("./types/types.js")(db);
	var texts = require("./schemas/text.js")(types);
	var roomuser = require("./schemas/roomuser.js")(types);
	var joinpart = require("./schemas/joinpart.js")(types);
	var admitexpel = require("./schemas/admitexpel.js")(types);
	var awayback = require("./schemas/awayback.js")(types);



	core.on('room',roomuser.put, "storage");
	core.on('user',roomuser.put, "storage");

	core.on('away', awayback.put, "storage");
	core.on('back', awayback.put, "storage");

	core.on('text', texts.put, 'storage');

	core.on('join', function(data, cb){
		data.role = "member";
		joinpart.put(data, cb);
	}, 'storage');
	core.on('part', function(data, cb){
		data.role = "none";
		joinpart.put(data, cb);
	}, 'storage');
	
	/* Should improve this to support follow_requested*/
	core.on('admit', function(data, cb){
		data.role = "member";
		admitexpel.put(data, cb);
	}, 'storage');
	core.on('expel', function(data, cb){
		data.role = "banned";
		admitexpel.put(data, cb);
	}, 'storage');


	core.on('messages', texts.get, 'storage');
	core.on('getUsers', roomuser.getUser, 'storage');
	core.on('getRooms', roomuser.getRoom, 'storage');
};
