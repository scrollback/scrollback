"use strict";

var log = require("../lib/logger.js"),
	url = require("../lib/url.js"),
	format = require("../lib/format.js"),
	buildTitle = require("../lib/build-title.js"),
	noOfThreads = 50,
	noOfText = 255;

module.exports = function(core) {
	function genLink(title, nav) {
		return "<a href='" + url.build({ nav: nav }) + "'>" + format.textToHtml(title) + "</a>";
	}

	function genRoomHtml(room) {
		return "<h1 itemprop='name'>" + room.id + "</h1>\n<p itemprop='description'>" + room.description + "</p>";
	}

	function genRoomListHtml(rooms) {
		return "<h1 itemprop='name'>Featured rooms</h1>\n<p>" + rooms.map(function(room) {
			return genLink(room.id, {
				mode: "room",
				room: room.id
			});
		}).join("\n") + "</p>";
	}

	function genTextHtml(res, roomid, threadid) {
		var a = res.map(function(text) {
				return "<p>" + format.textToHtml(text.from.replace(/^guest\-/, "") + ": " + text.text) + "</p>";
			});

		if (a.length > noOfText) {
			a.pop();

			a.push(genLink("Next", {
				mode: "chat",
				room: roomid,
				thread: threadid,
				textRange: { time: res[res.length - 1].time }
			}));
		}

		a.push(genLink("Discussion", {
			mode: "chat",
			room: roomid,
			thread: threadid
		}));

		a.push(genLink("Discussions in " + roomid, {
			mode: "room",
			room: roomid
		}));

		return a.join("\n");
	}

	function genThreadHtml(res, roomid) {
		var a = [],
			thread;

		for (var i = 0, l = Math.min(res.length, noOfThreads); i < l; i++) {
			thread = res[i];

			a.push(genLink("Discussions in " + thread.title, {
				mode: "chat",
				room: roomid,
				thread: thread.id,
				textRange: { time: thread.startTime }
			}));
		}

		if (res.length > noOfThreads) {
			a.push(genLink("Next", {
				mode: "chat",
				room: roomid,
				thread: thread.id,
				textRange: { time: res[res.length - 1].startTime }
			}));
		}

		a.push(genLink("Discussions in " + roomid, {
			mode: "room",
			room: roomid
		}));

		return a.join("\n");
	}

	function getHead(state, req, cb) {
		if (state.nav) {
			if (state.nav.mode !== "home" && state.nav.room) {
				return core.emit("getRooms", {
					ref: state.nav.room,
					session: "internal-http-seo"
				}, function(e, r) {
					var roompic;

					if (e) {
						log.e("SEO: Could not get data for room", state.nav.room);

						return cb(null);
					}

					if (r && r.results && r.results[0]) {
						roompic = req.protocol + "//" + req.get("host") + "/i/" + r.results[0].id + "/picture?size=256";

						if (state.nav.mode === "chat" && state.nav.thread) {
							return core.emit("getTexts", {
								to: state.nav.room,
								ref: state.nav.thread,
								session: "internal-http-seo"
							}, function(err, res) {
								var thread, parts, text, picture;

								if (err) {
									log.e("SEO: Could not get data for thread", state.nav.thread);

									return cb(null);
								}

								if (res && res.results && res.results[0]) {
									thread = res.results[0];

									if (thread.tags && thread.tags.indexOf("image") > -1 && thread.text) {
										parts = thread.text.match(/!\[([^\)]+)\]\((([^(\s\"\')]+)(\s+\".+\")?)(\))/);

										if (parts) {
											text = parts[1];
											picture = parts[3];
										}
									}

									state.indexes = { threadsById: {} };

									state.indexes.threadsById[thread.id] = thread;

									return cb({
										title: buildTitle(state),
										description: text || thread.text,
										picture: picture || roompic
									});
								}

								return cb(null);
							});
						} else {
							return cb({
								title: buildTitle(state),
								description: r.results[0].description,
								picture: roompic
							});
						}

						return null;
					}

					return cb(null);
				});
			}
		}

		return cb(null);
	}

	function getBody(state, req, cb) {
		var time;

		if (state.nav && state.nav.mode === "chat" && state.nav.room) {
			time = state.nav.textRange && state.nav.textRange.time ? state.nav.textRange.time : 1;

			return core.emit("getTexts", {
				to: state.nav.room,
				thread: state.nav.thread,
				time: time,
				after: noOfText + 1,
				session: "internal-http-seo"
			}, function(err, data) {
				var room = data.room;

				if (!err && data.results && room.params && (!room.params.http || room.params.http.seo)) {
					return cb(genRoomHtml(room) + "\n" + genTextHtml(data.results, state.nav.room, state.nav.thread));
				} else {
					return cb(null);
				}
			});
		} else if (state.nav && state.nav.mode === "room" && state.nav.room) {
			time = state.nav.threadRange && state.nav.threadRange.time ? state.nav.threadRange.time : 1;

			return core.emit("getThreads", {
				to: state.nav.room,
				time: time,
				after: noOfThreads + 1,
				session: "internal-http-seo"
			}, function(err, data) {
				var room = data.room;

				if (!err && data.results && room.params && (!room.params.http || room.params.http.seo)) {
					return cb(genRoomHtml(room) + "\n" + genThreadHtml(data.results, state.nav.room));
				} else {
					return cb(null);
				}
			});
		} else {
			return core.emit("getRooms", {
				featured: true,
				session: "internal-http-seo"
			}, function(err, res) {
				if (!err && res.results) {
					return cb(genRoomListHtml(res.results));
				} else {
					cb(null);
				}
			});
		}
	}

	function getSEO(req, cb) {
		var state = url.parse(req.path);

		if (state.context && state.context.embed) {
			return cb(null);
		}

		getHead(state, req, function(head) {
			getBody(state, req, function(body) {
				return cb({
					head: head,
					body: body,
					path: req.protocol + "//" + req.get("host") + req.path
				});
			});
		});
	}

	return { getSEO: getSEO };
};
