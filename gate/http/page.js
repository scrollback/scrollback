var config = require('../../config.js');
var fs = require("fs");
var code = fs.readFileSync(__dirname + "/../../client.min.js",'utf8');
exports.init = function(app) {
    app.get('*', function(req, res, next) {
        var rooms = [];
        console.log(req.path);
        var i, subURLs = req.path.substring(1).split("/+/");
        for (i = 0; i < subURLs.length; i++) {
            var obj = {};
            var sections = subURLs[i].split("/");
            obj.room = sections[0];
            obj.timestamp = sections[2];
            obj.tags = (typeof sections[1] !=="undefined")? sections[1].split("+"):[];
            rooms.push(obj);
        }
        var str = JSON.stringify(rooms);
        console.log(str);
        if(rooms[0].room=="client.min.js") {
            res.writeHead(200, {
                "Content-Type": "application/javascript; charset=utf-8",
                "Content-Length": Buffer.byteLength(code, "utf8")
            });
            res.end(code);
        }
        else {
           res.render("channel",rooms[0]);
        }
    });
}
