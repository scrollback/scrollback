var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
// var leveldb = new objectlevel(__dirname+"/"+config.leveldb.path);
var db = require('mysql').createConnection(config.mysql);
var accountConnection = require('mysql').createConnection(config.mysql);
var leveldb, types, text;
var startTimes = {};
var owners = {};
db.connect();

function closeConnection(){
	db.end();
}

function migrateTexts(limit, cb) {
	var f = 0;
	var stream = db.query("select * from text_messages order by time limit "+limit*1000+" , 1000");
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
		// console.log("---l---",text.threads);
		// console.log("+++++++++++");
		texts.put(text, function(err){
			if(err) console.log("Error inserting", text);
			else{
				// console.log("Inserting ", text);
				db.resume();
			}
		});
	});
	stream.on("error", function(err){
		log("Error:", err);
	});

	stream.on('end', function(){
		console.log("Mirgration Complete!");
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


	var i =0;
	function loop() {
		if(i>6) return;
		else {
			console.log(i*1000, (i+1)*1000);
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
	// console.log(element.labels, l);
	return l;
}