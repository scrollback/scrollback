var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
// var leveldb = new objectlevel(__dirname+"/"+config.leveldb.path);
var db = require('mysql').createConnection(config.mysql);
var accountConnection = require('mysql').createConnection(config.mysql);
var leveldb, types;
db.connect();
accountConnection.connect();
function closeConnection(){
	db.end();
	accountConnection.end();
}


function migrateRooms(cb) {
	var stream = db.query("select * from rooms;");
	stream.on("result", function(room) {
		db.pause();
		accountConnection.query("select * from accounts where room = ?", room.id, function(err, data) {
			if(err) {
				db.resume();
				 console.log(err);
				 return;
			}
			if(!data.length && room.type == "user") {
				db.resume();
				console.log("USER WITH NO A/C");
				return;
			}
			room.accounts = data;
			if(room.type == "user") types.users.put(room, function(){
				if(err) console.log(err);
				db.resume();
			});
			if(room.type == "room") types.rooms.put(room, function(){
				if(err) console.log(err);
				db.resume();
			});
		});
	});
	stream.on("error", function(err){
		log("Error:", err);
	});
	stream.on("end", function(){
		cb();
	});
}

function migrateMembers(cb){
	var stream = db.query("select * from members;");
	stream.on("result", function(row) {
		if(row.partedOn) return console.log("parted user");;
		console.log(row);
		types.rooms.link(row.room, 'hasMember', row.user, {
			role: "member",
			time: row.joinedOn
		});
	});
	stream.on("error", function(err){
		log("Error:", err);
	});
	stream.on("end", function(){
		cb();
	});	
}

(function(){
	var path = process.cwd();
	if(path.split("/")[path.split("/").length-1] !="scrollback"){
		return console.log("execute from the root of scrollback");
	}
	leveldb = new objectlevel(process.cwd()+"/leveldb-storage/"+config.leveldb.path);
	types = require("../leveldb-storage/types/types.js")(leveldb);
	migrateRooms(function(){
		migrateMembers(closeConnection);
	});
})();
