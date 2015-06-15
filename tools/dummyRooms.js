"use strict";

//var crypto = require('crypto');
var config = require("../server-config-defaults.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
var Validator = require("../lib/validator.js");
var db = require('mysql').createConnection(config.mysql);
var accountConnection = require('mysql').createConnection(config.mysql);
var leveldb, types;
db.connect();
accountConnection.connect();

/*function closeConnection() {
	db.end();
	accountConnection.end();
}

function createNow(cb) {
	var stream = db.query("select distinct `to` from text_messages");
	stream.on("result", function(room) {
		db.pause();
	});
	stream.on("error", function(err) {
		log("Error:", err);
	});
	stream.on("end", function() {
		cb();
	});
}*/

(function() {
	var path = process.cwd();
	if (path.split("/")[path.split("/").length - 1] !== "scrollback") {
		return console.log("execute from the root of scrollback");
	}
	leveldb = new objectlevel(process.cwd() + "/leveldb-storage/" + config.leveldb.path);
	types = require("../leveldb-storage/types/types.js")(leveldb);

	function start() {
		var stream = db.query("select distinct `to` from text_messages;");
		stream.on("result", function(row) {
			console.log(row.to);
			types.rooms.get(row.to, function(err, data) {
				var newRoom;
				if (!data) {
					row.to = new Validator(row.to).sanitize();
					newRoom = {
						id: row.to,
						description: "",
						createTime: new Date().getTime(),
						type: "room",
						picture: "",
						timezone: 0,
						identities: [],
						guides: {
							authorizer: {
								openFollow: true,
								readLevel: "guest",
								writeLEvel: "guest"
							}
						}
					};

					types.rooms.put(newRoom, function() {
						types.rooms.link(newRoom.id, 'hasMember', "migrator", {
							role: "owner",
							time: new Date().getTime()
						});
						db.resume();
					});
				} else {
					db.resume();
				}
			});
		});
		stream.on("error", function(err) {
			log("Error:", err);
		});
		stream.on("end", function() {
			console.log("done");
		});
	}

	start();
})();
/*
function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=retro';
}*/
