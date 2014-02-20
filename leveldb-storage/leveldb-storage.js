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
	var edit = require("./schemas/edit.js")(types);



	core.on('room',roomuser.put, "storage");
	core.on('user',roomuser.put, "storage");

	core.on('away', awayback.put, "storage");
	core.on('back', awayback.put, "storage");

	core.on('text', texts.put, 'storage');

	core.on('join', function(data, cb){
		data.role = data.role || "member";
		//for now the user cannot part a room.
		if(data.room.owner == data.user.id) data.role = "owner";
		joinpart.put(data, cb);
	}, 'storage');
	core.on('part', function(data, cb){
		//for now user cannot part the room he owns. also this needs to change rooms query is being handled by leveldb.
		if(data.room.owner == data.user.id)  {
			console.log("cant part sorry...");
			return cb();
		}
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

	core.on('edit', edit.put,'storage');
	core.on('messages', texts.get, 'leveldb');
	core.on('getUsers', roomuser.getUser, 'storage');
	core.on('getRooms', roomuser.getRoom, 'storage');
};
