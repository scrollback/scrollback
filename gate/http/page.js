var config = require('../../config.js'),
core = require("../../core/core.js"),
db = require("../../core/data.js"),
fs = require("fs"),
code = fs.readFileSync(__dirname + "/../../public/client.min.js",'utf8');
exports.init = function(app) {
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
    
    app.get("*",function(req,res){
        var params=req.path.substring(1).split("/"),responseObj={},query={},sqlQuery;
        
        query.to=params[0];
        query.type="text";
        query.limit=20;
        
        if (params[1] && params[1]!="since") {
            query.since=new Date(params[1]).getTime();
        }
        if( params[2] && params[2].length>1) {
            query.until=new Date(params[2]).getTime();
        }
        
        sqlQuery="select time from messages where `to`=? and `type`='text' order by `time` limit 1";
        db.query(sqlQuery,[query.to],function(err,data){
            
            if (data && data.length>0) {
                query.originTime=data[0].time ;
                if (!(query.until || query.since)) {
                    query.since=data[0].time;
                }
            }

            core.messages(query,function(m){
                responseObj.query=query;
                responseObj.data=m;
                
                query.title=query.to.replace(/[-]/g," ").split(" ").map(
                    function(string){
                        return string.charAt(0).toUpperCase() + string.slice(1);
                    }
                ).join(" ");
                
                if (query.originTime!==m[0].time) {
                    responseObj.scrollPrev=new Date(m[0].time).toISOString();
                }
                
                if (m[m.length-1].type==="result-end") {
                    responseObj.scrollNext=new Date(m[m.length-1].time).toISOString();
                }

                if (m.length==1 && m[0].type!="text") {
                    delete responseObj.scrollNext;
                    delete responseObj.scrollPrev;
                }

                res.render("archive",responseObj);		
            });
        });
    });
};
