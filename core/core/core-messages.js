var config = require('../../config.js');
var db = require('mysql').createConnection(config.mysql);

exports.messages = function(options, callback) {
    var query = "SELECT `from`, `to`, `type`, `text`, `time` "+
        "FROM `messages` ", where = [], params=[], desc=false, limit=256;
    
    if(options.until) {
        where.push("`time` < ?");
        params.push(options.until);
    }
    
    if(options.since) {
        where.push("`time` > ?");
        params.push(options.since);
    }
    
    if(options.to) {
        where.push("`to` = ?");
        params.push(options.to);
    }
    
    if(options.from) {
        where.push("`from` = ?");
        params.push(options.to);
    }
    
    if(options.type) {
        where.push("`type` = ?");
        params.push(options.type);
    }
    
    if(options.until && options.since) {
        limit = null;
    } else if(options.until) {
        desc = true;
    }
    
    if(where.length) query += " WHERE " + where.join(" AND ");
    query += " ORDER BY `time` " + (desc? "DESC": "ASC");
    if(limit) query += " LIMIT " + limit;
    
    if(desc) query = "SELECT * FROM (" + query + ") r ORDER BY time ASC";
    
    //console.log(query, params);
    db.query(query, params, function(err, data) {
        if(err) {
            console.log(err); return;
        }
        //console.log("RESULTS:", data.length);
        if(limit && data.length < limit) {
            (desc? data.unshift: data.push)({
                type: "notice", from: '', to: options.to || '',
                text: 'There are no more messages', time: 0
            });
        }
        callback(data);
    });
}