var config = require('../../config.js'),
core = require("../../core/core.js"),
db = require("../../core/data.js"),
fs = require("fs"),
code = fs.readFileSync(__dirname + "/../../public/client.min.js",'utf8');
exports.init = function(app) {
    
    var dialogs = {
        "login" : function(req, res){
            res.render("login", {
                user: req.session.user, 
                requireAuth: req.query.requireAuth
            });
        },
        "profile" : function(req, res){
			console.log("Retrieving session", req.session);
            res.render("profile", {user: req.session.user});
        },
		"cookie": function(req, res) {
			res.end(req.query.callback+"('"+req.cookies["scrollback_sessid"]+"')");
		},
		"debug": function(req, res) {
			res.end(req.cookies["scrollback_sessid"] + '\r\n' + JSON.stringify(require("./session.js").store));
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

    app.get('/t/*', function(req, res, next) {
        var streams = req.path.substring(3);
		
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
    
    app.get("*", function(req, res, next) {
        var params = req.path.substring(1).split("/"), responseObj={}, query={}, sqlQuery;
        
        query.to=params[0];
        query.type="text";
        query.limit=20;
        
        if(req.path.indexOf('.') !== -1) return;
        
        //sqlQuery="select min(m.time) min,max(m.time) max from messages m where `to`=? and `type`='text' order by `time` ";
        //db.query(sqlQuery,[query.to],function(err,data){
        //    
        //    
        //    
            if (params[1]) switch(params[1]) {
                case 'since':
                    query.since=new Date(params[2]).getTime();
                    break;
                case 'until':
                    query.until=new Date(params[2]).getTime();
                    break;
                case 'edit':
                    return next();
                    break;
            }
            
            console.log(query);
            
            core.messages(query, function(err, m){
				
                responseObj.query=query;
                responseObj.data=m;
                
                console.log("MESSAGES GAVE ME ", m.length);
                
                if (m[0].type == 'result-start') {
                    responseObj.scrollPrev = new Date(m[1].time).toISOString();
                }
                
                if (m[m.length-1].type == 'result-end') {
                    responseObj.scrollNext = new Date(m[m.length-1].time).toISOString();
                }
                
                query.title=query.to.replace(/(\W+|^)(\w)(\w*)/g, function(m, s, f, r) {
                    return f.toUpperCase() + r.toLowerCase() + ' ';
                });
                
                if (m.length==1 && m[0].type!="text") {
                    delete responseObj.scrollNext;
                    delete responseObj.scrollPrev;
                }
                
                if (!query.since && !query.until) {
                    delete responseObj.scrollNext;
                }
                
                responseObj.relDate = function (input, reference){
                    
                    var SECOND = 1000,
                        MINUTE = 60 * SECOND,
                        HOUR = 60 * MINUTE,
                        DAY = 24 * HOUR,
                        WEEK = 7 * DAY,
                        YEAR = DAY * 365,
                        MONTH = YEAR / 12;
                    
                    var formats = [
                        [ SECOND, 'a second' ],
                        [ 0.7 * MINUTE, 'seconds', SECOND ],
                        [ 1.5 * MINUTE, 'a minute' ],
                        [ 60 * MINUTE, 'minutes', MINUTE ],
                        [ 1.5 * HOUR, 'an hour' ],
                        [ DAY, 'hours', HOUR ],
                        [ 1.5 * DAY, 'a day' ],
                        [ 7 * DAY, 'days', DAY ],
                        [ 1.5 * WEEK, 'a week'],
                        [ MONTH, 'weeks', WEEK ],
                        [ 1.5 * MONTH, 'a month' ],
                        [ YEAR, 'months', MONTH ],
                        [ 1.5 * YEAR, 'a year' ],
                        [ Number.MAX_VALUE, 'years', YEAR ]
                    ];
                    
                    !reference && ( reference = (new Date).getTime() );
                    reference instanceof Date && ( reference = reference.getTime() );
                    
                    input instanceof String && ( input = new Date(input) );
                    input instanceof Date && ( input = input.getTime() );
                    
                    var delta = reference - input,
                    format, i, len;
                    
                    for(i = -1, len=formats.length; ++i < len; ){
                        format = formats[i];
                        if(delta < format[0]){
                            return format[2] == undefined ? format[1] : Math.round(delta/format[2]) + ' ' + format[1];
                        }
                    };
                    return "Long, long";
                }
                
                res.render("archive",responseObj);		
            });
        //});
    });


    app.get("*/edit/*", function(req, res) {
        var params = req.path.substring(1).split("/"), roomId, renderObject = {}, responseHTML = "";
        

        if(params[1] != "edit") {
            return next();
        }

        roomId = params[0];
        core.room(roomId,function(err,room) {
            if(err) throw err;

            renderObject.id = roomId;
            console.log(roomId);

            if(room.pluginConfig && room.pluginConfig[params[2]]) {
                renderObject.config = room.pluginConfig[params[2]];
            }
            console.log(renderObject);
            responseHTML = core.getConfigUi(params[2])(renderObject);
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(responseHTML);
        });
    })

    app.post("*/edit/*", function(req, res) {
        var params = req.path.substring(1).split("/"), roomId, renderObject = {}, responseHTML = "";

        if(params[1] != "edit") {
            return next();
        }

        
    });
};
