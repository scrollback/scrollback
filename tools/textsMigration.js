var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
var generate = require("../lib/generate.js");
var db;
var leveldb, types, text;
var startTimes = {};
var startingTime = 0;
var recordCount = 0;
var fs = require('fs');

function closeConnection(){
	db.end();
}


function hashIt(name) {
	function hash(s) {		
		var h=7, i, l;
		for (i=0, l=s.length; i<l; i++) {
			h = (h*31+s.charCodeAt(i)*795028841)%(1e9+9);
		}
		return h%(1e9+9);
	}
	return hash(name);
}

function generateThreaderId(id){
	var h = "";
	for (var i = 0;i < 1000;i++) {
		h += hashIt(id + "," + i).toString(16);
		if(h.length >= 32) {
			h = h.substring(0, 32);
			break
		}
	}
	
	return h;
}


function migrateTexts(limit, cb) {
	var stream, lastIndex = 0;
	db = require('mysql').createConnection(config.mysql);
	db.connect();
	stream = db.query("select * from text_messages where `time` > "+startingTime+" order by `time` limit 1000");
	stream.on("result", function(text) {
		db.pause();
		text.type = "text";

		text.threads = [];
		if(text.labels) {
			l = fixLabels(text);
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
					var t = {}, id, title, index;
					i = i.replace(/^thread-/, "");
					index = i.indexOf(":");

					if(index>=0) {
						title = i.substring(index+1);
						i = i.substring(0,index);
					}else {
						title = text.text;
					}

					if(i.length<32) {
						i = generateThreaderId(i);	
					}

					if(i.length == 32){
						i += hashIt(i) & 9;
					}

					if(!startTimes[i]) startTimes[i] = text.time;
					text.threads.push({
						id: i,
						title: title,
						to: text.to,
						startTime: startTimes[i] || {}
					});
				});
			}
		}
		texts.put(text, function(err) {
			recordCount++;
			console.log(text.time+": record: "+recordCount);
			startingTime = text.time;
			lastindex = startingTime;
			if(err) {
				db.resume();
			}else{
				db.resume();
			}
		});
	});
	stream.on("error", function(err){
		done();
	});

	stream.on('end', function() {
		done();
	});
	db.end();

	function done() {
		storeIndex(startingTime);
		setTimeout(function(){
			cb && cb();
		}, 1000);
	}
}

(function() {
	var path = process.cwd();
	if(path.split("/")[path.split("/").length-1] !="scrollback") {
		return console.log("execute from the root of scrollback");
	}
	leveldb = new objectlevel(process.cwd()+"/leveldb-storage/"+config.leveldb.path);
	types = require("../leveldb-storage/types/types.js")(leveldb);
	texts = require("../leveldb-storage/schemas/text.js")(types);

	fs.readFile('./.recordCount', 'utf8', function (err,data) {
		if(data) {
			recordCount = parseInt(data);
		}else{
			recordCount = 0;
		}
		
		fs.readFile('./.index', 'utf8', function (err,data) {
			var i = 0;
			if(data) {
				startingTime = data;
			}else {
				startingTime = 0;
			}
			function loop(pos) {
				if(i>8170) return;
				else {
					migrateTexts(i++, loop);
				}
			}
			loop();
		});
	});
	
})();


function storeIndex(index) {
	fs.writeFile("./.index", index, function(err) {
		fs.writeFile("./.recordCount", recordCount, function(err) {
			console.log("writing done");
		});
	});
}

function fixLabels(element) {
	var labelObj, i, l ;
	if(!element.labels) {
		return [];
	}
	try {
		labelObj = JSON.parse(element.labels);
		l = [];
		for(i in labelObj){
			if(labelObj.hasOwnProperty(i) && labelObj[i]){
				l.push(i);
			}
		}
		console.log(element.labels);
	}catch(Exception) {
		l = [element.labels];
	}
	return l;
}