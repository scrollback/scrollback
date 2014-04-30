var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
// var leveldb = new objectlevel(__dirname+"/"+config.leveldb.path);
var db = require('mysql').createConnection(config.mysql);
var accountConnection = require('mysql').createConnection(config.mysql);
var leveldb, types;

var owners = {};
db.connect();

function closeConnection(){
	db.end();
}

function migrateTexts(cb) {
	var stream = db.query("select * from text_messages order by time desc");
	stream.on("result", function(text) {
		db.pause();
		// types.texts.put()
		text.type = "text";
		console.log(text);
		types.texts.put(text, function(err){
			if(err) console.log("Error inserting", text);
			else{
				console.log("Inserting ", text);
				db.resume();
			}
		});
	});
	stream.on("error", function(err){
		log("Error:", err);
	});

	stream.on('end', function(){
		console.log("Mirgration Complete!");
	});
}

(function(){
	var path = process.cwd();
	if(path.split("/")[path.split("/").length-1] !="scrollback"){
		return console.log("execute from the root of scrollback");
	}
	leveldb = new objectlevel(process.cwd()+"/leveldb-storage/"+config.leveldb.path);
	types = require("../leveldb-storage/types/types.js")(leveldb);
	migrateTexts();
})();