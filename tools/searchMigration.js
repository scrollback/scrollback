var config = require("../config.js");
var objectlevel = require("objectlevel");
var log = require("../lib/logger.js");
var generate = require("../lib/generate.js");
var db;
var leveldb, types, text;
var startTimes = {};
var threads = {};
var startingTime = 0;
var recordCount = 0;
var fs = require('fs');
var searchServer = config.search.server + ":" + config.search.port;
var es = require('elasticsearch');
var client = new es.Client({
    host: searchServer
});

(function() {
	var path = process.cwd();
	var i =0, l;
	if(path.split("/")[path.split("/").length-1] !="scrollback") {
		return console.log("execute from the root of scrollback");
	}
	leveldb = new objectlevel(process.cwd()+"/leveldb-storage/"+config.leveldb.path);
	types = require("../leveldb-storage/types/types.js")(leveldb);
	var types = require("../leveldb-storage/types/types.js")(leveldb);

  
  
    function processThreads(thread, callback) {
    	var dbQuery = {
    		gte: [],
    		lte: []
    	};
        if(threads[thread.id]) return callback();
		dbQuery.by = "tothreadtime";
    	
    	dbQuery.gte.push(thread.to);
		dbQuery.lte.push(thread.to);
    	
		dbQuery.gte.push(thread.id);
		dbQuery.lte.push(thread.id);
    	types.texts.get(dbQuery, function(err, texts) {
    		var newThread = {};
    		var postData = {body: []};

    		newThread.id = thread.id;
    		newThread.room = thread.to;
            
    		texts.forEach(function(t) {
    			newThread[t.id] = t.text;
    		});
    		postData.body.push({
                index: {
                    _index: 'sb',
                    _type: 'threads',
                    _id: thread.id
                }
            });
            postData.body.push(newThread);
            postData.timeout = 28164102982;
    		client.bulk(postData, function(err, resp) {
                if(err) console.log(err);
                if(resp) console.log("thread "+newThread.id+ ": with " +texts.length+ " messages Took "+resp.took); //i dont care abt grammer
                var fs = require("fs");
                fs.appendFileSync('.threadList', ","+newThread.id);
                threads[newThread.id] = true;
	            callback();
	        });
    		
    	});
    }
    function start() {
        
    }
    
    fs.readFile('.threadList', 'utf8',function (err, data) {
        if(err) return start();
        data.split(",").forEach(function(i) {
            threads[i] = true;
        });
        
        start();
    });
    
    function start() {
        types.threads.get(function(err, data) {
            var i=0, l = data.length;

            // console.log(data.length);

            function loop(i) {
                processThreads(data[i], function() {
                    i++;
                    
                    if(i<l) loop(i);
                });	
            }
            loop(i);
        });
    }
})();
