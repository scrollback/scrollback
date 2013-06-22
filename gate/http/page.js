var config = require('../../config.js');
var fs = require("fs");
var code = fs.readFileSync(__dirname + "/../../public/client.min.js",'utf8');
exports.init = function(app) {
    app.get('*', function(req, res, next) {
        var streams = req.path.substring(1).split("/+/").map(function(p) {
            return p.split('/')[0];
        });
        res.render("room", {
            streams: JSON.stringify(streams),
            title: streams.join(', ').replace(/\b[a-z]/g, function(m) {
                return m.toUpperCase();
            })
        });
    });
};
