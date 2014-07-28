var log = require('../lib/logger.js');
var config = require('../config.js');
var internalSession = Object.keys(config.whitelists)[0];
var noOfThreads = 50;
var noOfText = 255;

//https://local.scrollback.io/scrollback/srzko2ro9m4yobrdfkuhg3uxva8oz6og0?time=2014-07-24T09:44:22.973Z&tab=threads
//https://local.scrollback.io/scrollback?time=2014-07-24T09:46:25.026Z&tab=threads
module.exports = function(core) { 
    return {
        getSEOHtml: getSEOHtml 
    };
    function getSEOHtml(req, callback) {
        var url = req.url;
        var path = req.path;
        var query = req.query;
        var a = path.substring(1).split("/");
        
        if (a[1]) {
            core.emit("getTexts", {to: a[0], thread: a[1], time: query.time ? new Date(query.time).getTime() : 1, 
                                   after: noOfText + 1, session: internalSession}, function(err, data) {
                var room = data.room;
                if (!err && data.results && room.params.http && room.params.http.seo) {
                       callback(null, getTextHtml(data.results, a[0], a[1]));
                } else callback(null, "");
            }); 
        } else {//threads.
            if(!query.time) {
                callback(null, "<a style=\"display:none\" href=" + getURL(1, a[0]) + ">Go to Top</a></br>"); 
            } else {
                core.emit("getThreads", {to: a[0], time: new Date(query.time).getTime(), 
                    after: noOfThreads + 1, session: internalSession}, function (err, data) {
                    var room = data.room;
                    if (!err && data.results && room.params.http && room.params.http.seo) {
                        var r = getThreadsHtml(data.results, a[0]);
                        callback(null, r);
                    } else callback(null, "");
                });
            }
        }
    };

}


function getTextHtml(r, roomid, threadid) {        
    var a = r.map(function(text){
        var t = "[ " + text.from.replace("guest-", "") + " ] " + text.text;
        t = htmlEscape(t);
        return ("<div style=\"display:none\">" + t + "</div>"); 
    });
    a.pop();
    if(a.length > noOfText) {
        a.push("<a href=\"/" + roomid +"/" +threadid + "?time=" + 
               new Date(r[r.length - 1].time).toISOString() + 
               "&amp;tab=threads\">next</a>");
    }
    a.push("<a style=\"display:none\" href=\"" + roomid + "/" + threadid + "\">Go to Top</a>");
    return a.join(" ");
    
}

function getURL(time, roomid) {
	log("time", time, "roomId", roomid);
	return "\"/" + roomid + "?time=" + new Date(time).toISOString() + "&amp;tab=threads\"";
}

function getThreadsHtml(r, roomid) {
    var a = [];
	for (var i = 0; i < Math.min(r.length, noOfThreads);i++ ){
		var thread = r[i];
		a.push("<a style=\"display:none\" href='" + roomid + "/" + 
               thread.id + "?time=" + new Date(thread.startTime).toISOString() +  
               "&amp;tab=threads'>" + htmlEscape(thread.title) + "</a>");
	};
	if(r.length > noOfThreads) {
		a.push("<a style=\"display:none\" href=" + getURL(r[r.length - 1].startTime, roomid) + ">Next</a>");
	}
    a.push("<a style=\"display:none\" href=\"" + getURL(1, roomid) + "\">Go to Top</a>");
	
	return a.join(" ");
}

function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}



