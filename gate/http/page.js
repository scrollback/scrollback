var config = require('./config.js');
var fs = require("fs");
var wh = require("./warehouse.js");

var res = require("./lib/respond.js"),
    log = require("./lib/logger.js").tag('AA/AP'),
    success = res.success, failure = res.failure;

exports.init = function(app) {
    app.get('*', function(req, res, next) {
        var rooms = [];
        var i, subURLs = req.path.split("/+/");
        for (i = 0; i < subURLs.length; i++) {
            var obj = {};
            var sections = subURLs[i].split("/");
            obj.room = sections[0];
            obj.timestamp = sections[2];
            obj.tags = sections[1].split("+");
            rooms.push(obj);
        }
        var str = JSON.stringify(rooms);
        res.writeHead(200, {
            "Content-Type": "text/json",
            "Content-Length": str.length
        });
        res.end(str);
    });
}