var log = require("../lib/logger.js");
var config = require('../config.js');
var es = require('elasticsearch');
var indexName = 'sb';
var client;
    
var searchTimeout = 10000;
module.exports = function (core) {
    if(!client) {
        init();
    }
    if (config.search) {
        
        /*Index text*/
        core.on('text', function (message, callback) {
            if (message.type === "text") {
                callback();
                var data = {};
                
                data.type = 'text';
                data.id = message.id;
                data.body =  {
                    "text": message.text,
                    "time": message.time,
                    "room": message.to,
                    "author": message.from.replace(/guest-/g, ""),
                    "threads": message.threads
                }
                index(data);
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
                }
                index(data);
            }
        }, "watchers");
        
        /*Search text by a phrase/keyword */
        core.on('getTexts', function (qu, callback) {
            var data = {};
            var query = {};
            console.log("query string: " + qu.q);
            if (!qu.q) {
                return callback();
            }
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
            console.log("query string: " + qu.q);
            if (!qu.q) {
                return callback();
            }
            data.type = 'room';
            query = { query: { match: { description: qu.q}}};
            data.body = query;
            data.qu = qu;
            search(data,callback); 
        }, "watchers");
        
        /*Search threads by a keyword/phrase */
        core.on('getThreads', function (qu, callback) {
            var data = {};
            var query = {};
            console.log("query string: " + qu.q);
            if (!qu.q) {
                return callback();
            }
            data.type = 'text';
            query = { query: { text: qu.q}};
            data.body = query;
            data.qu = qu;
            searchThreads(data,callback); 
        }, "watchers");
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
    }
    client.search(searchParams).then (function (response) {
        data.qu.results = response.hits.hits;
        callback(data.qu);
    }, function (error) {
        log(error);
    });
}

function searchThreads(data, callback){
    var searchParams = {
        index: indexName,
        type: data.type,
        timeout: searchTimeout,
        query: {
            "filtered": {
                "query": data.body.query,
                "filter": {
                    "numeric_range": {
                        "time": {
                            "lt": Date.now(),
                            "gte": data.qu.afterThis
                        }
                    }
                }
            }
        }    }
    //log(JSON.stringify(searchParams));
    client.search(searchParams).then (function (response) {
        var threads = new Array();   
        var unique = {};
        response.hits.hits.forEach(function(e){ 
            if(e._source.threads) {
                var id = e._source.threads[0].id;
                if(!unique[id]) {
                    threads.push(e._source.threads[0].id);
                    unique[id] = true;
                }
            }
        });
        data.qu.results = threads;
        callback(data.qu);
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