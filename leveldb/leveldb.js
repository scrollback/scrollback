var config = require("../config.js");
var objectlevel = require("objectlevel");

module.exports = function(core) {
	var db = new objectlevel(__dirname+"/"+config.leveldb.path);
	var types = require("./types/types.js")(db);
	var texts = require("./schemas/text.js")(types);
	var roomuser = require("./schemas/roomuser.js")(types);
	var joinpart = require("./schemas/joinpart.js")(types);

	core.on('text', texts.put, 'storage');
	core.on('getUser', roomuser.getUser, 'storage');
	core.on('getRoom', roomuser.getRoom, 'storage');
	core.on('join', function(data, cb){
		data.role = "member";
		joinpart.roleChange(data, cb);
	}, 'storage');
	core.on('part', function(data, cb){
		data.role = "none";
		joinpart.roleChange(data, cb);
	}, 'storage')
	core.on('messages', texts.get, 'storage');
	core.on('room', roomuser.put,'storage');
};