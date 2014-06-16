var log = require("../lib/logger.js");
var config = require('../config.js');
var searchDB = require('../lib/redisProxy.js').select(config.redisDB.search);
var es = require('elasticsearch');
var indexName = 'sb';
var client;
    
var searchTimeout = 10000;
var messageCount = 0;
var updateThreads = [];
module.exports = function (core) {
    if(!client) {
        init();
    }
    if (config.search) {
        
        /*Index text*/
        core.on('text', function (message, callback) {
            if (message.type === "text") {
                
                if(message.threads) {
                    message.threads.forEach(function(e) {
                        if(updateThreads.indexOf(e.id)<0) {
                            updateThreads.push(e.id);

                            searchDB.set("thread:{{"+e.id+"}}", JSON.stringify( {
                                id: e.id,
                                room: message.to
                            }), insertText);

                            searchDB.sadd("updateThread", e.id);
                        }else {
                            insertText();
                        }

                        function insertText() {
                            searchDB.sadd("thread:{{"+e.id+"}}:texts", message.id+":"+message.text, function() {
                                messageCount++;
                                if(messageCount >=5) {
                                    indexTexts();
                                }
                            });
                        }
                        
                    });
                }
                callback();
            }
        }, "watchers");
        
        /*Index rooms*/
        core.on('room', function (room, callback) {
            if (room.type === "room") {
                callback();
                var data = {};
                data.type = 'room';
                data.id = room.id;
                data.body = {
                    "description": room.description,
                    "type": room.type
                };
                index(data);
            }
        }, "watchers");
        
        /*Search text by a phrase/keyword */
        core.on('getTexts', function (qu, callback) {
            var data = {};
            var query = {};
            
            if (!qu.q) {
                return callback();
            }
            console.log("query string: " + qu.q);
            data.type = 'text';
            query = { query: { match: { text: qu.q }}};
            data.body =  query;   
            data.qu = qu;
            search(data,callback);
        }, "watchers");
        
        /*Search rooms by description */
        core.on('getRooms', function (qu, callback) {
            var data = {};
            var query = {};
            if (!qu.q) {
                return callback();
            }

            console.log("query string getThre: " + qu.q);
            data.type = 'room';
            query = { query: { match: { description: qu.q}}};
            data.body = query;
            data.qu = qu;
            search(data,callback); 
        }, "watchers");
        
        /* Search threads by a keyword/phrase */
        core.on('getThreads', function (qu, callback) {
            var data = {}, position;
            var query = {};
            if (!qu.q) {
                return callback();
            }
            data.type = 'threads';
            query = {query: { match: {"_all": qu.q}}};

            if(qu.to){
                query.filter = {
                    term: {
                        room: qu.to
                    }
                };
            }
            
            position = query.from = qu.pos || 0;

            if(qu.before) {
                position = position - qu.before;
                if(position<0) {
                    query.size = qu.before + position;
                    position = 0;
                }else {
                    query.size = qu.before;
                }
            } else {
                query.size = qu.after || 10;
            }
            
            data.body = query;
            data.qu = qu;
            console.log(query);
            searchThreads(data,callback); 
        }, "cache");
    } else {
        log("Search module is not enabled");
    }
};

function index(data){
    client.index({
        index: indexName,
        type: data.type,
        id: data.id,
        body: data.body
    }, function (error, resp) {
        if (error) { console.log(error);}
        log(resp);
    });
}

function search(data, callback){
    var searchParams = {
        index: indexName,
        type: data.type,
        timeout: searchTimeout,
        body: data.body
    };
    client.search(searchParams).then (function (response) {
        data.qu.results = response.hits.hits;
        callback();
    }, function (error) {
        log(error);
    });
}

function searchThreads(data, callback){
    var searchParams = {
        index: indexName,
        type: data.type,
        timeout: searchTimeout,
        body:data.body
    };
    //log(JSON.stringify(searchParams));
    client.search(searchParams).then (function (response) {
        var threads = [];
        
        response.hits.hits.forEach(function(e){ 
            threads.push(e._source.id);
        });
        if(threads.length) {
            data.qu.ref = threads;
            callback();
        }else{
            data.qu.results  = [];
            return callback();
        }
    }, function (error) {
        log(error);
    });
}
 
function init() {
    log("Connecting to Elasticsearch server .... ");
    var searchServer = config.search.server + ":" + config.search.port;
    client = new es.Client({
        host: searchServer
    });
}



function indexTexts() {
    var ids = updateThreads;
            
    updateThreads = [];

    constructBulk(ids, function(postData) {
        client.bulk(postData, function(err, resp) {
            console.log(err, resp);
        });
    });
}


/* couldnt think of a better name here. please feel free to change*/
function generateNewThread(threadID, callback) {
    var newThread = {};
    newThread.id = threadID;

    searchDB.get("thread:{{"+threadID+"}}", function(err, t) {
        if(err || !t) return callback(null);

        try{ t = JSON.parse(t); }
        catch(e) { return callback(null); }

        newThread.room = t.room;

        searchDB.smembers("thread:{{"+threadID+"}}:texts", function(err, texts) {

            if(err || !texts) return callback(null);

            texts.forEach(function(e) {
                var index = e.indexOf(':');
                var id = e.substring(0, index);
                var text = e.substring(index + 1);
                newThread[id] = text;
            });

            callback(newThread);
        });
    });
}



function constructBulk(threadIds, callback) {
    var threads={}, postData = {body: []}, l = threadIds.length;

    threadIds.forEach(function(e) {
        generateNewThread(e, function(t) {
            i++;
            if(t) threads[t.id] = t;
            if(!(i<l)) processThreads();
        });
    });

    function processThreads() {
         Object.keys(threads).forEach(function(e) {
            e = threads[e];

            postData.body.push({
                index: {
                    _index: indexName,
                    _type: 'threads',
                    _id: e.id
                }
            });
            postData.body.push(e);
        });
        callback(postData);
    }
}
