/* jshint jquery: true */
/* global libsb, $ */

var personEl = require("./person.js"),
	peopleArea = {};
$(function () {
	var $people = $(".pane-people"),
		people = [],
		roomName = "";

	function resetList(index) {
		getPeople(function () {
			$people.reset(index);
		});
	}

	function getPeople(callback) {
		var ppl = {},
			sorted = [];
		libsb.getUsers({
			memberOf: roomName
		}, function (err, res) {
			var r = res.results,
				i, l;

			r = r.map(function (user) {
				return $.extend({}, user);
			});

			if (r) {
				for (i = 0, l = r.length; i < l; i++) {
					ppl[r[i].id] = r[i];
					if (r[i].role == "owner") ppl[r[i].id].score = 6;
					else ppl[r[i].id].score = 1;
				}
			}

			libsb.getUsers({
				occupantOf: roomName
			}, function (err, res) {
				var r = res.results,
					e,
					i, l;

				r = r.map(function (user) {
					return $.extend({}, user);
				});

				if (r) {
					for (i = 0, l = r.length; i < l; i++) {
						if (ppl[r[i].id]) {
							ppl[r[i].id].score += 3;
						} else {
							ppl[r[i].id] = r[i];
							ppl[r[i].id].score = 3;
						}
						ppl[r[i].id].status = "online";
					}
				}

				for (e in ppl) {
					if (ppl.hasOwnProperty(e)) {
						sorted.push(ppl[e]);
					}

				}

				sorted.sort(function (a, b) {
					return -(a.score - b.score);
				});

				people = sorted;
				callback();
			});
		});
	}
	
	function listener(event){
		libsb.on(event, function (action, next) {
//			console.log(action.type+": ", action);
			if(action.to === roomName) resetList();
			next();
		}, 100);
	}
	["join-dn", "part-dn", "away-dn", "back-dn"].forEach(listener);

	// Set up infinite scroll here.
	$people.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 100,
		startIndex: 0,
		getItems: function (index, before, after, recycle, callback) {
			var res = [], from, to, i;
			
			if (before) {
				if (typeof index === "undefined") return callback([false]);
				from = index - before;
				to = index;
			} else {
				if (typeof index === "undefined" || index < 0) index = 0;
				from = index;
				to = index + after;
			}

			if(from < 0) from = 0;
			if(to >= people.length) to = people.length - 1;

			for (i = from; i <= to; i++) {
				if (typeof people[i] !== "undefined") {
					res.push(personEl.render(null, people[i], i));
				}
			}
			if(before){
				if(res.length < before) res.unshift(false);
			}
			else if(after){
				if(res.length < after) res.push(false);
			}
			callback(res);
		}
	});
	
	libsb.on('navigate', function (state, next) {
		var reset = false;
		if (state.source == 'people-area') return next();
		roomName = state.roomName;
		
		if(state.old){
			if(state.tab == "people"){
				$(".pane-people").addClass("current");
				if(state.tab != state.old.tab) reset = true;
			}else{
				$(".pane-people").removeClass("current");
			}
			
			if(state.source == "boot") reset = true;
			if(state.old.connectionStatus != state.connectionStatus) reset = true;
			if(state.roomName != state.old.roomName) reset = true;
		}else {
			reset = true;
		}

		if (reset) resetList();
		next();
	}, 600);

	peopleArea.setBottom = function (bottom) {
		var atBottom = ($people.scrollTop() + $people.height() == $people[0].scrollHeight);

		$people.css({
			bottom: bottom
		});
		if (atBottom) $people.scrollTop($people[0].scrollHeight);
	};

	peopleArea.setRoom = function (r) {
		roomName = r;
		$people.reset();
	};
});