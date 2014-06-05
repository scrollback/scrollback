var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
// var leveldb = new objectlevel(__dirname+"/"+config.leveldb.path);
var db;
// = require('mysql').createConnection(config.mysql);
//var accountConnection = require('mysql').createConnection(config.mysql);
var leveldb, types, text;
var startTimes = {};
var owners = {}, startingIndex = "";
var recordCount = 0;

//db.connect();

function closeConnection(){
	db.end();
}

function migrateTexts(limit, cb) {
	db = require('mysql').createConnection(config.mysql);
	db.connect();
	var f = 0;
	var stream = db.query("select * from text_messages where id > '"+startingIndex+"' limit 1000");
	stream.on("result", function(text) {
		db.pause();
		// types.texts.put()
		text.type = "text";

		text.threads = [];
		if(text.labels) {
			l = fixLabels(text);
			// console.log("---l---",l);
			if(l.indexOf("hidden") >= 0) {
				text.labels = {
					hidden: 1
				};
				l.splice(l.indexOf("hidden"),1);
			}else{
				text.labels = {};
			}
			
			if(l.length) {
				l.forEach(function(i) {
					if(!startTimes[i]) startTimes[i] = text.time;
					text.threads.push({
						id: i,
						title: i,
						to: text.to,
						startTime: startTimes[i] || {}
					});
				});
			}
		}
		texts.put(text, function(err) {
			recordCount++;
			console.log(text.id+": record: "+recordCount);
			startingIndex = text.id;
			if(err) {
				db.resume();
			}else{
				db.resume();
			}
		});
	});
	stream.on("error", function(err){
		db.end();
		cb && cb();
	});

	stream.on('end', function() {
		db.end();
		cb && cb();
	});
}

(function(){
	var i;
	var path = process.cwd();
	if(path.split("/")[path.split("/").length-1] !="scrollback"){
		return console.log("execute from the root of scrollback");
	}
	leveldb = new objectlevel(process.cwd()+"/leveldb-storage/"+config.leveldb.path);
	types = require("../leveldb-storage/types/types.js")(leveldb);
	texts = require("../leveldb-storage/schemas/text.js")(types);


	var i = 0;
	function loop() {
		if(i>8170) return;
		else {
			migrateTexts(i++, loop);
		}
	}
	loop();
	
})();




function fixLabels(element) {
	var labelObj, i, l ;
	if(!element.labels){
		return [];
	}
	try{
		labelObj = JSON.parse(element.labels);
		l = [];
		for(i in labelObj){
			if(labelObj.hasOwnProperty(i) && labelObj[i]){
				l.push(i);
			}
		}
		console.log(element.labels);
	}catch(Exception){

		l = [element.labels];
	}
	return l;
}
