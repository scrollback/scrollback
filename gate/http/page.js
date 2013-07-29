var config = require('../../config.js');
var fs = require("fs");
var code = fs.readFileSync(__dirname + "/../../public/client.min.js",'utf8');
exports.init = function(app) {
    
    var dialogs = {
        "login" : function(req,res){
            res.render("login");
        },
        "profile" : function(req,res){
            res.render("profile");
        }
    };
    
    app.get("/dlg/*",function(req,res){
        var dialog=req.path.substring(1).split("/")[1];
        if(dialogs[dialog]) {
            dialogs[dialog](req,res);
        }
        else{
            res.render("error");
        }
    });
    app.get("/pwn/*",function(req,res){
        var room = req.path.substring(1).split("/")[1];
        var url=req.path.replace("/pwn/"+room+"/","");
        if(url.indexOf("http://")<0){
            url="http://"+url;
        }
        res.render("pwn",{
            room:room,
            url:url
        });
    });
    app.get('*', function(req, res, next) {
        var streams = req.path.substring(1);
		if (streams.indexOf('.') !== -1 || streams.split('/')[0].length < 4) {
			return next();
		}
		streams = streams.split("/+/").map(function(p) {
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
