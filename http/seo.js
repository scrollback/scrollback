var log = require('../lib/logger.js');
var config = require('../config.js');
var internalSession = Object.keys(config.whitelists)[0];
var noOfObj = 10;

//https://local.scrollback.io/scrollback/srzko2ro9m4yobrdfkuhg3uxva8oz6og0?time=2014-07-24T09:44:22.973Z&tab=threads
//https://local.scrollback.io/scrollback?time=2014-07-24T09:46:25.026Z&tab=threads
module.exports = function (core, req, callback) {
	var url = req.url;
	var path = req.path;
	var query = req.query;
	var a = path.substring(1).split("/");
	if(!query.time) query.time = new Date().getTime();
	core.emit("getThreads", {to: a[0], time: new Date(query.time).getTime(), before: noOfObj + 1, session: internalSession}, function (err, data) {
		if(!err && data.results && data.results[0]) {
			var room = data.room;
			if(room.params.http && room.params.http.seo) {
				var r = getThreadsHtml(data.results, a[0]);
				log("arguments", JSON.stringify(arguments));
				callback(null, r);
			} else callback(null, "");
		}
	});
};

function getURL(time, roomid) {
	log("time", time, "roomId", roomid);
	return "/" + roomid + "?time=" + new Date(time).toISOString() + "&tabs=threads";
}


function getThreadsHtml(r, roomid) {
	var ret = "";
	for (var i = 0;i < Math.min(r.length, noOfObj);i++ ){
		var thread = r[i];
		ret +=  "<a style=\"display:none\" href=" + roomid + "/" + thread.id + "?time=" + new Date(thread.startTime).toISOString() +  "&tab=threads>" + thread.title + "</a></br>";
		log(ret);
	};
	if(r.length > noOfObj) {
		ret += "<a style=\"display:none\" href=" + getURL(r[r.length - 1].startTime, roomid) + ">Next</a></br>";
	}
	log("HTML", ret);
	return ret;
}
