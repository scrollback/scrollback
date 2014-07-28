var config = require("../config.js");
var objectlevel = require("objectlevel");

module.exports = function (core) {
    var db = new objectlevel(__dirname + "/" + config.leveldb.path);
    var types = require("./types/types.js")(db);
    var texts = require("./schemas/text.js")(types);
    var roomuser = require("./schemas/roomuser.js")(types);
    var joinpart = require("./schemas/joinpart.js")(types);
    var admitexpel = require("./schemas/admitexpel.js")(types);
    var edit = require("./schemas/edit.js")(types);
    var threads = require("./schemas/thread.js")(types);


    core.on('room', roomuser.put, "storage");
    core.on('user', roomuser.put, "storage");
    core.on('init', function (init, callback) {
        if (/^guest-/.test(init.user.id)) return callback();

        core.emit("getRooms", {
            hasMember: init.user.id,
            session: init.session
        }, function (err, data) {
            if (err) return callback();
            if (!data || !data.results) init.memberOf = [];
            else init.memberOf = data.results;
            return callback();
        });
    }, "modifier");

    core.on('text', texts.put, 'storage');

    core.on('join', function (data, cb) {
        // data.role = data.role || "member";
        //for now the user cannot part a room.
        // if(data.room.owner == data.user.id) data.role = "owner";
        if (data.user.role == "owner") data.role = "owner";
        else data.role = "follower";
        joinpart.put(data, cb);
    }, 'storage');
    core.on('part', function (data, cb) {
        if (data.user.role == "owner") return cb(new Error("cant part as owner"));
        // if(data.room.owner == data.user.id)  {
        // 	console.log("cant part sorry...");
        // 	return cb();
        // }
        data.role = "none";
        joinpart.put(data, cb);
    }, 'storage');

    /* Should improve this to support follow_requested*/
    core.on('admit', function (data, cb) {
        data.role = "member";
        admitexpel.put(data, cb);
    }, 'storage');
    core.on('expel', function (data, cb) {
        data.role = "banned";
        admitexpel.put(data, cb);
    }, 'storage');

    core.on('edit', edit.put, 'storage');
    core.on('getUsers', roomuser.getUsers, 'storage');
    core.on('getRooms', roomuser.getRooms, 'storage');
    core.on('getThreads', threads.get, 'storage');
    core.on('getTexts', texts.get, 'storage');
};