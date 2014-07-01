var crypto = require('crypto');
var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
var generate = require("../lib/generate.js");
var validate = require("../lib/validate.js");
var fs = require('fs');
var url = require("url");
var db = require('mysql').createConnection(config.mysql);
var accountConnection = require('mysql').createConnection(config.mysql);
var leveldb, types, texts, startTimes = {}, startingTime = 0, recordCount = 0;
var owners = {};
db.connect();
accountConnection.connect();
function closeConnection(){
	db.end();
	accountConnection.end();
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
			break;
		}
	}
	
	return h;
}


function migrateTexts(limit, cb) {
	var stream, lastIndex = 0, l;
	stream = db.query("select * from text_messages where `time` > "+startingTime+" order by `time` limit 1000");
	stream.on("result", function(text) {
		db.pause();
		text.type = "text";
        text.to = validate(text.to, true);
        text.from = validate(text.from, true);
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
					var t = {}, title, index;
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
		}else{
            text.labels = {};
        }
        
        if(/^\/me /.test(text.text)) {
            text.text = text.text.replace(/^\/me /,"");
            text.labels.action = 1;
        }
        
		texts.put(text, function(err) {
			recordCount++;
			console.log(text.time+": record: "+recordCount);
			startingTime = text.time;
			lastIndex = startingTime;
			if(err) {
				db.resume();
			}else{
				db.resume();
			}
		});
	});
	stream.on("error", function(err){
        console.log(err);
		done();
	});

	stream.on('end', function() {
        console.log("ended");
		done();
	});
//	db.end();

	function done() {
		storeIndex(startingTime);
		setTimeout(function(){
			if(cb) cb();
		}, 1000);
	}
}

function migrationStart() {
	
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
			function loop() {
				if(i>8170) return;
				else {
					migrateTexts(i++, loop);
				}
			}
			loop();
		});
	});
	
}


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
            
            room.id = validate(room.id, true);
			var newRoom = {
				id: room.id,
				description: room.description,
				createTime: room.createdOn,
				type: room.type,
				picture: "",
				timezone:0,
				identities: [],
                guides: {
                    authorizer: {
                    }
                }
			};

			try{
				newRoom.params = JSON.parse(room.params);
                if(typeof newRoom.params == "string") newRoom.params = {};
			}
			catch(e){
				newRoom.params = {};
			}
            
			if(data) {
                data.forEach(function(account) {
                    var u;
                    newRoom.identities.push(account.id);
                    if (/^irc/.test(account.id)) {
                        u = url.parse(account.id);
                        newRoom.params.irc = {
                            server: u.host,
                            channel: u.hash,
                            enabled: true,
                            pending: false
                        };
                    }
                });
            }

			if (newRoom.type == "user") {
                newRoom.picture = generatePick(newRoom.identities[0].replace(/mailto:/, ""));
				newRoom.params.email = {
					frequency : "daily",
					notifications : true
				};
				types.users.put(newRoom, function() {
					if(err) console.log(err);

					db.resume();
				});	
			} 
			if (newRoom.type == "room") {
				if (newRoom.params.twitter && newRoom.params.twitter.profile && newRoom.params.twitter.profile.username) {
					newRoom.identities.push("twitter://" + newRoom.id + ":" + newRoom.params.twitter.profile.username);
                    (function() {
                        var twitter = {
                            username: newRoom.params.twitter.id,
                            tags: newRoom.params.twitter.tags,
                            token: newRoom.params.twitter.token,
                            tokenSecret: newRoom.params.twitter.tokenSecret,
                            profile: {
                                screen_name: newRoom.params.twitter.profile.username, user_id: newRoom.params.twitter.profile.id}
                        };
                        newRoom.params.twitter = twitter;
                    })();
				}else{
                    newRoom.params.twitter = {};
                }
                
                newRoom.params.http = {};
                if(typeof newRoom.params.allowSeo !== "undefined") {
                    newRoom.params.http.seo = newRoom.params.allowSeo;
                    delete newRoom.params.allowSeo;
                }else{
                    newRoom.params.http.seo = true;
                }
                
                newRoom.guides.authorizer.readLevel = "guest";
                newRoom.guides.authorizer.openFollow = true;
                if(typeof newRoom.params.loginrequired !== "undefined") {
                    newRoom.guides.authorizer.writeLevel = newRoom.params.loginrequired? "registered" : "guest";
                    delete newRoom.params.loginrequired;
                }
                
                newRoom.params.antiAbuse = {};
                if(typeof newRoom.params.wordban !== "undefined") {
                    newRoom.params.antiAbuse.wordblock = newRoom.params.wordban;
                    delete newRoom.params.wordban;
                }else {
                    newRoom.params.antiAbuse.wordblock = false;
                }
                newRoom.params.antiAbuse.customWords =[];
                
                if(typeof newRoom.params.irc !== "object") newRoom.params.irc = {};
                
				types.rooms.put(newRoom, function(){
					if (err) console.log(err);
					owners[room.id] = room.owner;
                    if(room.id === room.owner) {
                        types.rooms.link(room.id, 'hasMember', "migrator", {
                            role: "owner",
                            time: newRoom.createdOn
                        }, function(){
                            db.resume();
                        });
                    }else{
                        types.rooms.link(room.id, 'hasMember', room.owner, {
                            role: "owner",
                            time: newRoom.createdOn
                        }, function(){
                            db.resume();
                        });
                    }
					
				});
			}
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
		if(row.partedOn) return console.log("parted user");
		if(owners[row.room] === row.user) return console.log("owner spotted.");
		types.rooms.link(row.room, 'hasMember', row.user, {
			role: "follower",
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
    texts = require("../leveldb-storage/schemas/text.js")(types);
    types.users.put({
        id: "migrator",
        description: "",
        createTime: new Date().getTime(),
        type: "room",
        picture: generatePick("mailto:migrator@scrollback.io"),
        timezone: 0,
        identities: ["mailto:migrator@scrollback.io"]
    }, function(){
        migrateRooms(function() {
            migrateMembers(function() {
                migrationStart();
            });
        });
    });
})();

function generatePick(id) {
	return 'https://gravatar.com/avatar/' + crypto.createHash('md5').update(id).digest('hex') + '/?d=monsterid';
}

