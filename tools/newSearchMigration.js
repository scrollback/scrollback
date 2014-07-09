var config = require("../config.js");
var fs = require("fs");
var objectlevel = require("objectlevel");
var levelup = require('levelup');
var db = levelup('./leveldb-storage/data');
var stream;
var leveldb, types;
var start;
var searchServer = config.search.server + ":" + config.search.port;
var es = require('elasticsearch');
var client, lastKey;
var postData = null;
var forceStart = false;
var threadListFile, threadIndexFile, writingList = [];
var threadMap = {}, count = 0;

var l;
function gotThread(thread) {
    var newThread = {}, dbQuery, t;
    stream.pause();
    lastKey = thread.key;
    t = JSON.parse(thread.value);
    
    if(threadMap[thread.key] || lastKey.indexOf("dthread")<0) {
        console.log("skipping",lastKey);
        return stream.resume();
    }
    
    newThread.id = t.id;
    writingList.push(thread.key);
    newThread.room = t.to;
    newThread.texts = [];
    newThread.users = [];
    
    if(postData === null){
        postData = {body: []};
    }
    
    dbQuery = {
        gte: [],
        lte: []
    };
    
    dbQuery.by = "tothreadtime";
    dbQuery.gte.push(t.to);
    dbQuery.lte.push(t.to);
    dbQuery.gte.push(t.id);
    dbQuery.lte.push(t.id);
    
    types.texts.get(dbQuery, function(err, texts) {
      if(err) {
               console.log("Error:", err);
               return stream.resume();
       }

        texts.forEach(function(t) {
            newThread.texts.push(t.text);
            if(newThread.users.indexOf(t.from) <0) newThread.users.push(t.from);
        });
        texts = null;
        
        postData.body.push({
            index: {
                _index: 'sb',
                _type: 'threads',
                _id: t.id
            }
        });
        postData.body.push(newThread);
        postData.timeout = 60*60*1000;
        count++;
        if(postData.body.length >=100) {
            indexThreads();
        }else {
            stream.resume();
        }
    });
}

function indexThreads(cb) {
    client.bulk(postData, function(err) {
        postData = null;
        if(err) console.log("Error: ", err.message);
        writeProgress();
        stream.resume();
        if(cb) return cb();
    });
}

function writeProgress() {
    updateStatus(lastKey);
//    console.log(lastKey);
    if(process.stdout.clearLine) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write("---"+Math.floor((count/l)*100)+"% completed.");
    }else{
        console.log("---"+Math.floor((count/l)*100)+"% completed.");
    }   
}


function go(){
    stream = db.createReadStream({
        gte: Buffer(start),
        lte: Buffer.concat([Buffer("dthreads\0"), Buffer([0xff])])
    });

    if(count) console.log("Starting at: "+start+" with count: "+count);
    
    stream.on('data', gotThread);
    stream.on('error', console.log.bind(console));
    stream.on('end', function(){
        if(postData) indexThreads(process.exit);
    });
}


function startUp() {
    var threads, buf = new Buffer(50), bytesRead;
    client = new es.Client({
        host: searchServer
    });

    if(process.argv[2] == "--fs") {
        forceStart = true;
    }
    leveldb = new objectlevel(process.cwd()+"/leveldb-storage/"+config.leveldb.path);
    types = require("../leveldb-storage/types/types.js")(leveldb);
    
    try {
        threads = fs.readFileSync("./threadLists.txt", "utf8");
        threads = threads.split("\n");
        threads.forEach(function(id){
            threadMap[id] = true;
        });
        
        count = threads.length;
    }catch(e) {
        threads = [];
        console.log("Error: ", e.message);
        threadMap = {};
    }

    threadListFile = fs.openSync("./threadLists.txt","a+");
    
    if (!threads.length || !threads[threads.length-2]) {
        start = "dthreads\0" ;
    } else {
        console.log(threads[threads.length-2]);
        start = threads[threads.length-2];
    }
    
    if(forceStart) start = "dthreads\0" ;
    
    console.log("starting at: ",start);
    types.threads.get(function(err, data) {
        l = data.length;
        console.log("Indexing "+l+" threads.");
        data = null;
        go();
    });
}

function updateStatus(id) {
    var buf;
    writingList.forEach(function(id){
        fs.writeSync(threadListFile, id+"\n");
    });
    writingList = [];
}
function done() {
    fs.close(threadListFile);
}

startUp();
process.on("exit", function(){
    console.log("Exiting");
    done();
});