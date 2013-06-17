var config = require('../../config.js');
var fs = require("fs");

exports.init = function(app) {
    app.get('*', function(req, res, next) {
        var rooms = [];
        // we do a substring because the leading / causes an "" as the first
        // element in the array
        var i, subURLs = req.path.substring(1).split("/+/");
        for (i = 0; i < subURLs.length; i++) {
            var obj = {};
            var sections = subURLs[i].split("/");
            obj.room = sections[0];
            obj.timestamp = sections[2];
            obj.tags = sections[1] != undefined ? sections[1].split("+") : [];
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
