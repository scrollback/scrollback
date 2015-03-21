var log = require('../lib/logger.js');
var config;
var noOfThreads = 50;
var noOfText = 255;

module.exports = function(core, conf) {
	config = conf;
	return {
		getSEOHtml: getSEOHtml
	};
	/**
    callback with object {head: {string}, body: {string}}
    */
	function getSEOHtml(req, callback) {
		var query = req.query;
		if (!query.embed) {
			getHeadHtml(req, function(head) {
				getBodyHtml(req, function(body) {
					callback({
						head: head,
						body: body
					});
				});
			});
		} else {
			callback({
				head: "",
				body: ""
			});
		}
	}

	function getHeadHtml(req, callback) {
		var path = req.path;
		var a = path.substring(1).split("/");
		var ct = 0;
		var thread;
		var room;

		function done() {
			if (++ct == 2) {
				if (room) callback(genHeadHtml(room, thread));
				else callback("");
			}
		}
		if (a[0]) {
			if (a[1]) {
				core.emit("getThreads", {
					to: a[0],
					ref: a[1],
					session: "internal-http-seo"
				}, function(err, data) {
					log.d("Results:", data);
					if (!err && data && data.results && data.results.length) {
						thread = data.results[0];
						done();
					} else done();

				});

			} else done();

			core.emit("getRooms", {
				ref: a[0],
				session: "internal-http-seo"
			}, function(err, data) {
				if (!err && data.results && data.results[0]) {
					room = data.results[0];
					done();
				} else done();
			});
		} else callback("");
	}

	function getBodyHtml(req, callback) {
		var path = req.path;
		var query = req.query;
		var a = path.substring(1).split("/");

		if (a[1]) {
			core.emit("getTexts", {
				to: a[0],
				thread: a[1],
				time: query.time ? new Date(query.time).getTime() : 1,
				after: noOfText + 1,
				session: "internal-http-seo"
			}, function(err, data) {
				var room = data.room;
				if (!err && data.results && room.params && (!room.params.http || room.params.http.seo)) {
					var r = getRoomHtml(room) + "\n" + getTextHtml(data.results, a[0], a[1]);
					callback(r);
				} else callback("");
			});
		} else if (a[0]) { //threads.
			if (!query.time) query.time = new Date(1).toISOString();
			core.emit("getThreads", {
				to: a[0],
				time: new Date(query.time).getTime(),
				after: noOfThreads + 1,
				session: "internal-http-seo"
			}, function(err, data) {
				var room = data.room;
				if (!err && data.results && room.params && (!room.params.http || room.params.http.seo)) {
					var r = getRoomHtml(room) + "\n" + getThreadsHtml(data.results, a[0]);
					callback(r);
				} else callback("");
			});

		} else callback("");
	}

};


function getRoomHtml(room) {
	var r = "";
	r += "<h1 itemprop=\"name\">" + room.id + "</h1>";
	r += "<p itemprop=\"description\">" + room.description + "</p>";
	return r;
}

function getTextHtml(r, roomid, threadid) {
	var a = r.map(function(text) {
		var t = text.from.replace("guest-", "") + ": " + text.text;
		t = htmlEscape(t);
		return ("<p>" + t + "</p>");
	});

	if (a.length > noOfText) {
		a.pop();
		a.push("<a href=\"/" + roomid + "/" + threadid + "?time=" +
			new Date(r[r.length - 1].time).toISOString() +
			"&amp;tab=threads\">Next</a>");
	}

	a.push("<a href=\"/" + roomid + "/" + threadid + "\">Discussion</a>");
	a.push("<a href=" + getURL(1, roomid) + ">Discussions in " + roomid + "</a>");
	return a.join("\n");

}

function getURL(time, roomid) {
	log("time", time, "roomId", roomid);
	return "\"/" + roomid + "?time=" + new Date(time).toISOString() + "&amp;tab=threads\"";
}

function getThreadsHtml(r, roomid) {
	var a = [];
	for (var i = 0; i < Math.min(r.length, noOfThreads); i++) {
		var thread = r[i];
		a.push("<a href='/" + roomid + "/" +
			thread.id + "?time=" + new Date(thread.startTime).toISOString() +
			"&amp;tab=threads'>" + htmlEscape(thread.title) + "</a>");
	}
	if (r.length > noOfThreads) {
		a.push("<a href=" + getURL(r[r.length - 1].startTime, roomid) + ">Next</a>");
	}
	a.push("<a href=" + getURL(1, roomid) + ">Discussions in " + roomid + "</a>");

	return a.join("\n");
}

function htmlEscape(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

function genHeadHtml(room, thread) {
	var r = [];
	var roomIcon = "https://" + config.host + "/s/img/scrollback-preview.png";
	r.push("<meta name=\"description\" content=\"" + htmlEscape(room.description) + "\">");
	r.push("<meta name=\"twitter:card\" content=\"summary\" />");
	r.push("<meta name=\"twitter:title\" content=\"" + htmlEscape(room.id) + " on scrollback\">");
	r.push("<meta name=\"twitter:description\" content=\"" + htmlEscape(room.description) + "\">");
	r.push("<meta name=\"twitter:image\" content=\"" + roomIcon + "\">"); //just a placeholder for now
	r.push("<meta property=\"og:type\" content=\"website\"/>");
	r.push("<meta property=\"og:url\" content=\"https://" + config.host + "/" + room.id + "\">");
	r.push("<meta property=\"og:title\" content=\"" + htmlEscape(room.id) + " on scrollback\">");
	r.push("<meta property=\"og:description\" content=\"" + htmlEscape(room.description) + "\">");
	r.push("<meta property=\"og:image\" content=\"" + roomIcon + "\">"); //just a placeholder for now
	r.push("<title>" + ((thread && thread.title) ? htmlEscape(thread.title) : (room.id + " on Scrollback")) + "</title>");
	r.push("<link rel=\"image_src\" href=\"" + roomIcon + "\">");
	return r.join("\n");
}
