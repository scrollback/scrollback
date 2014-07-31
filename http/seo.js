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
    /**
    callback with object {head: {string}, body: {string}}
    */
    function getSEOHtml(req, callback) {
        getHeadHtml(req, function(head) {
            getBodyHtml(req, function(body) {
                callback({ head: head, body: body}); 
            });
        });
    }
    
    function getHeadHtml(req, callback) {
        var path = req.path;
        var a = path.substring(1).split("/");
        if(a[0]) {
            core.emit("getRooms", {ref: a[0], session: internalSession}, function(err, data) {
                if(!err && data.results && data.results[0]) {
                    callback(genHeadHtml(data.results[0]));
                } else callback("");
            });
        } else callback("");
    }
    
    function getBodyHtml(req, callback) {
        var path = req.path;
        var query = req.query;
        var a = path.substring(1).split("/");
        
        if (a[1]) {
            core.emit("getTexts", {to: a[0], thread: a[1], time: query.time ? new Date(query.time).getTime() : 1, 
                                   after: noOfText + 1, session: internalSession}, function(err, data) {
                var room = data.room;
                if (!err && data.results && (!room.params.http || room.params.http.seo)) {
                       callback(getTextHtml(data.results, a[0], a[1]));
                } else callback("");
            }); 
        } else if(a[0]){//threads.
            if(!query.time) {
                callback("<a style=\"display:none\" href=" + getURL(1, a[0]) + ">Go to Top</a>"); 
            } else {
                core.emit("getThreads", {to: a[0], time: new Date(query.time).getTime(), 
                    after: noOfThreads + 1, session: internalSession}, function (err, data) {
                    var room = data.room;
                    if (!err && data.results && (!room.params.http || room.params.http.seo)) {
                        var r = getThreadsHtml(data.results, a[0]);
                        callback(r);
                    } else callback("");
                });
            }
        } else callback("");
    }

};


function getTextHtml(r, roomid, threadid) {        
    var a = r.map(function(text){
        var t = "[ " + text.from.replace("guest-", "") + " ] " + text.text;
        t = htmlEscape(t);
        return ("<div style=\"display:none\">" + t + "</div>"); 
    });
    
    if(a.length > noOfText) {
        a.pop();
        a.push("<a href=\"/" + roomid +"/" +threadid + "?time=" + 
               new Date(r[r.length - 1].time).toISOString() + 
               "&amp;tab=threads\">Next</a>");
    }
    
    a.push("<a style=\"display:none\" href=\"/" + roomid + "/" + threadid + "\">Go to Top</a>");
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
		a.push("<a style=\"display:none\" href='/" + roomid + "/" + 
               thread.id + "?time=" + new Date(thread.startTime).toISOString() +  
               "&amp;tab=threads'>" + htmlEscape(thread.title) + "</a>");
	}
	if(r.length > noOfThreads) {
		a.push("<a style=\"display:none\" href=" + getURL(r[r.length - 1].startTime, roomid) + ">Next</a>");
	}
    a.push("<a style=\"display:none\" href=" + getURL(1, roomid) + ">Go to Top</a>");
	
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

function genHeadHtml(room) {
    var r = [];
    var roomIcon = "https://" + config.http.host + "/s/img/scrollback.png"; 
    r.push("<meta name=\"description\" content=\"" + htmlEscape(room.description) + "\">");
    r.push("<meta name=\"twitter:card\" content=\"summary\" />");
    r.push("<meta name=\"twitter:title\" content=\"" + htmlEscape(room.id) + " on scrollback\">");
    r.push("<meta name=\"twitter:description\" content=\"" + htmlEscape(room.description) + "\">");
    r.push("<meta name=\"twitter:image\" content=\"" + roomIcon + "\">"); //just a placeholder for now
    r.push("<meta property=\"og:type\" content=\"website\"/>");
    r.push("<meta property=\"og:url\" content=\"https://" + config.http.host + "/" +  room.id + "\">");
    r.push("<meta property=\"og:title\" content=\"" + htmlEscape(room.id) + " on scrollback\">");
    r.push("<meta property=\"og:description\" content=\"" + htmlEscape(room.description) + "\">");
    r.push("<meta property=\"og:image\" content=\"" + roomIcon + "\">"); //just a placeholder for now
    r.push("<title>" + room.id + " on scrollback</title>");
    r.push("<link rel=\"image_src\" href=\"" + roomIcon + "\">"); 
    return r.join("\n");
}

