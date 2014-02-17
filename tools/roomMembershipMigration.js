var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
// var leveldb = new objectlevel(__dirname+"/"+config.leveldb.path);
var db = require('mysql').createConnection(config.mysql);
var accountConnection = require('mysql').createConnection(config.mysql);
var leveldb, types;

var owners = {};
db.connect();
accountConnection.connect();
function closeConnection(){
	db.end();
	accountConnection.end();
}


function migrateRooms(cb) {
	var stream = db.query("select * from rooms order by rooms.type DESC;");
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
			var newRoom = {
				id: room.id,
				description: room.description,
				createdOn: room.createdOn,
				type: room.type,
				picture: room.picture,
				timezone:0,
				identities: [],
				accounts: room.accounts
			}

			try{
				newRoom.params = JSON.parse(room.params);
			}
			catch(e){
				newRoom.params = {};
			}
			room.accounts && room.accounts.forEach(function(account) {
				newRoom.identities.push(account.id);
			});
			if(newRoom.type == "user") types.users.put(newRoom, function(){
				if(err) console.log(err);
				db.resume();
			});
			if(newRoom.type == "room") types.rooms.put(newRoom, function(){
				if(err) console.log(err);
				owners[room.id] = room.owner;
				types.rooms.link(room.id, 'hasMember', room.owner, {
					role: "owner",
					time: newRoom.createdOn
				}, function(){
					db.resume();
				});
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
		if(owners[row.room] === row.user) return console.log("owner spotted.");;
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
