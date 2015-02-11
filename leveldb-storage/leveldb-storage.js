var objectlevel = require("objectlevel"), config;

module.exports = function(core, conf) {
	config = conf;
	var db = new objectlevel(__dirname + "/" + config.path);
	var types = require("./types/types.js")(db, config);
	var texts = require("./schemas/text.js")(types, config);
	var roomuser = require("./schemas/roomuser.js")(types, config);
	var joinpart = require("./schemas/joinpart.js")(types, config);
	var admitexpel = require("./schemas/admitexpel.js")(types, config);
	var edit = require("./schemas/edit.js")(types, config);
	var threads = require("./schemas/thread.js")(types, config);

	core.on('room', roomuser.put, "storage");
	core.on('user', roomuser.put, "storage");
	core.on('init', function(init, callback) {
		if (/^guest-/.test(init.user.id)) return callback();

		core.emit("getRooms", {
			hasMember: init.user.id,
			session: init.session
		}, function(err, data) {
			if (err) return callback();
			if (!data || !data.results) init.memberOf = [];
			else init.memberOf = data.results;
			return callback();
		});
	}, "modifier");

	core.on('text', texts.put, 'storage');

	core.on('join', function(data, cb) {
		// data.role = data.role || "member";
		//for now the user cannot part a room.
		// if(data.room.owner == data.user.id) data.role = "owner";
		if (data.user.role == "owner") data.role = "owner";

		joinpart.put(data, cb);
	}, 'storage');
	core.on('part', function(data, cb) {
		if (data.user.role == "owner") return cb(new Error("cant part as owner"));
		// if(data.room.owner == data.user.id)  {
		// 	console.log("cant part sorry...");
		// 	return cb();
		// }
		data.role = "none";
		joinpart.put(data, cb);
	}, 'storage');

	/* Should improve this to support follow_requested*/
	core.on('admit', function(data, cb) {
		admitexpel.put(data, cb);
	}, 'storage');
	core.on('expel', function(data, cb) {
		data.role = data.role || "banned";
		admitexpel.put(data, cb);
	}, 'storage');

	core.on('edit', edit.put, 'storage');
	if (!config.disableQueries) {
		core.on('getUsers', roomuser.getUsers, 'storage');
		core.on('getRooms', roomuser.getRooms, 'storage');
		core.on('getThreads', threads.get, 'storage');
		core.on('getTexts', texts.get, 'storage');
	}
};
