var log = require("../lib/logger.js");
var config = require('../config.js');
var searchDB = require('../lib/redisProxy.js').select(config.redisDB.search);
var es = require('elasticsearch');
var indexName = 'sb';
var client;
    
var searchTimeout = 10000;
var messageCount = 0;
var updateThreads = [];



/*
    this function takes a list of ids and gets the thread objects from the elastic search.
*/
function getOldThreads(ids, callback) {
    var data = {}, response = {}, query;
    ids = ids.slice(0, ids.length);
    data.index = indexName;
    data.type = 'threads';
    query = {query: { match_all: {}}};

    data.body = query;
    
    data.body.filter = {
        "ids" : {
            "type" : "threads",
            "values" : ids
        }
    };
    
    client.search(data, function(err, resp) {
        var oldThread = {};
        if(err || !resp.hits || !resp.hits.hits ||!resp.hits.hits.length) {
            response = {};
        }else {
            oldThread = resp.hits.hits;
            oldThread.forEach(function(result){
                response[result._source.id] = result._source;
            });
        }

        return callback(response);
    });
}

/* couldnt think of a better name here. please feel free to change.
    this function takes a threadID, gets the new texts in that thread from redis.
    uses this new texts to construct the thread object.
    and fires the callback with the new texts and participants.
*/
function generateNewThread(threadID, callback) {
    var newThread = {};
    newThread.id = threadID;

    searchDB.get("thread:{{"+threadID+"}}", function(err, t) {
        if(err || !t) return callback(null);

        try{ t = JSON.parse(t); }
        catch(e) { return callback(null); }

        newThread.room = t.room;
        newThread.texts = [];
        newThread.users = [];

        searchDB.smembers("thread:{{"+threadID+"}}:texts", function(err, texts) {

            if(err || !texts) return callback(null);

            texts.forEach(function(e) {
                var index = e.indexOf(':');
                /* not needed right now. var id = e.substring(0, index); */
                var text = e.substring(index + 1);
                index = text.indexOf(':');
                var from = text.substring(0, index);
                text = text.substring(index + 1);
                newThread.texts.push(text);
                if(newThread.users.indexOf(from)<0) newThread.users.push(from);
            });

            callback(newThread);
        });
    });
}

function getNewThreads(ids, callback) {
    function asyncForEach(list, resp, callback) {
        if(!list.length) return callback(resp);
        
        generateNewThread(list.splice(0,1)[0], function(t) {
            if(t && t.id) resp[t.id] = t;
            asyncForEach(list, resp, callback);
        });
    }
    return asyncForEach(ids.slice(0, ids.length), {}, callback);
}

function constructPostData(ids, callback) {
    getOldThreads(ids, function(oldThreads) {
        getNewThreads(ids, function(newThreads) {
            var  postData = {body: []}, newKeys = Object.keys(newThreads);
            newKeys.forEach(function(id) {
                if(oldThreads[id] && oldThreads[id].texts) {
                    oldThreads[id].texts.forEach(function(e) {
                        if(newThreads[id] && newThreads[id].texts) newThreads[id].texts.push(e);
                    });
                }
                if(oldThreads[id] && oldThreads[id].users) {
                    oldThreads[id].users.forEach(function(e) {
                        if(newThreads[id] && newThreads[id].users) newThreads[id].users.push(e);
                    });
                }
            });
            
            if(newKeys.length) {
                newKeys.forEach(function(id) {
                    postData.body.push({
                        index: {
                            _index: indexName,
                            _type: 'threads',
                            _id: id
                        }
                    });
                    postData.body.push(newThreads[id]);
                    return callback(postData);
                });
            }else{
                return callback(postData);
            }
            
            
        });    
    });
}

function indexTexts() {
    var ids = updateThreads;
    updateThreads = [];
    constructPostData(ids, function(postData) {
        client.bulk(postData, function(err, resp) {
            if(err) log(err, resp);
            searchDB.flushdb();
        });
    });
}

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
                            searchDB.sadd("thread:{{"+e.id+"}}:texts", message.id+":"+message.from+":"+message.text, function() {
                                messageCount++;
                                if(messageCount >=100) {
                                   indexTexts();
                                    messageCount = 0;
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
            callback();
            var data = {};
            data.type = 'room';
            data.id = room.id;
            data.body = {
                "description": room.description,
                "type": room.type
            };
                index(data);
        }, "watchers");
        
/*        Search text by a phrase/keyword 
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
        */
        /*Search rooms by description */
        core.on('getRooms', function (qu, callback) {
            var data = {};
            var query = {};
            if (!qu.q) {
                return callback();
            }

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
    
    searchDB.smembers("updateThread", function(err, threads) {
        if(threads) {
            updateThreads = updateThreads.concat(threads);
            messageCount = updateThreads.length;
        }
    });
}