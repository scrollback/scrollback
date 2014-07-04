var config = require("../config.js");
var fs = require("fs");
var objectlevel = require("objectlevel");
var levelup = require('levelup');
var db = levelup('./leveldb-storage/data');
var stream;
var leveldb, types, text;
var start;

var searchServer = config.search.server + ":" + config.search.port;
var es = require('elasticsearch');
var client = new es.Client({
    host: searchServer
});
var threadsToInsert = [], lastKey;
var postData = null;
leveldb = new objectlevel(process.cwd()+"/leveldb-storage/"+config.leveldb.path);
types = require("../leveldb-storage/types/types.js")(leveldb);


var l, insert = [];
function gotThread(thread) {
    var newThread = {}, dbQuery;
    stream.pause();
    lastKey = thread.key;
    if(postData === null){
        postData = {body: []};
    }
    t = JSON.parse(thread.value);

    newThread.id = t.id;
    newThread.room = t.to;
    newThread.texts = [];
    newThread.users = [];
    
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

function indexThreads() {
    client.bulk(postData, function(err, resp) {
        postData = null;
        if(err) throw(err);
        writeProgress();
        stream.resume();
    });
}

function writeProgress() {
    fs.writeFileSync(".threadIndex", lastKey);
    fs.writeFileSync(".threadCount", count);
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
    
    stream.on('data', gotThread)
    stream.on('error', console.log.bind(console))
    stream.on('end', indexThreads)
}


try {
    start = fs.readFileSync(".threadIndex") + '\0';
} catch(e) {
    start = "dthreads\0" ;
}
try {
    count = parseInt(fs.readFileSync(".threadCount", 'utf8'));
} catch(e) {
    count = 0;
}

types.threads.get(function(err, data) {
    var i=0;
    l = data.length;
    console.log("Indexing "+l+" threads.");
    data = null;
    go();
});

