/* jshint jquery: true */
/* global libsb, window */

var personEl = require("./person.js"),
    peopleArea = {};
window.peopleAreaLoaded = false;

$(function () {
    var levels = [0, 1, 3, 4, 6, 9];

    var $people = $(".pane-people"),
        roomName = "",
        lists = {
            people1: [false],
            people3: [],
            people4: [],
            people6: [],
            people9: [false]
        };

    function getNextArray(l) {
        var index = levels.indexOf(l);
        if (index <= 0) return 0;
        return levels[index - 1];
    }

    function getPrevArray(l) {
        var index = levels.indexOf(l);
        if (index < 0) return 0;
        return levels[index + 1];
    }

    function checkForUser(user, list) {
        var i, l;
        for (i = 0, l = list.length; i < l; i++) {
            if (list[i] && list[i].id == user.id) return true;
        }
        return false;
    }

    function getPeople(callback) {
        var ppl = {},
            sorted = [];
        libsb.getUsers({
            memberOf: roomName
        }, function (err, res) {
            var r = res.results,
                i, l;
            if(r) {
                for (i = 0, l = r.length; i < l; i++) {
                    ppl[r[i].id] = r[i];
                    if (r[i].role == "owner") ppl[r[i].id].score = 6;
                    else ppl[r[i].id].score = 1;
                }

            }
            libsb.getUsers({
                occupantOf: roomName
            }, function (err, res) {
                var r = res.results, e,
                    i, l;
                if(r) {
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
                
                for (e in ppl)
                    if (ppl.hasOwnProperty(e)) {
                        sorted.push(ppl[e]);
                    }

                sorted.sort(function (a, b) {
                    return -(a.score - b.score);
                });

                sorted.forEach(function (e) {
                    if (!checkForUser(e, lists["people" + e.score])) lists["people" + e.score].push(e);
                });

                callback();
            });
        });
    }

	libsb.on("init-dn", function(init, next) {
		getPeople(function(){
			$people.reset();
		});
		
		next();
	}, 100);
    libsb.on("away-dn", function (action, next) {
        var i, l, lis;

        if (!roomName || action.to !== roomName) return next();

        if (action.user.role == "follower") {
            lis = 4;
            lists.people1.push(action.user);
            action.user.score = 1;
        } else if (action.user.role == "owner") {
            lis = 9;
            lists.people6.push(action.user);
            action.user.score = 6;
        } else {
            lis = 3;
        }

        for (i = 0, l = lists["people" + lis].length; i < l; i++) {
            if (lists["people" + lis][i] && lists["people" + lis][i].id == action.user.id) {
                delete lists["people" + lis][i];
                break;
            }
        }
        $people.reset();
        next();
    }, 1);

    libsb.on("back-dn", function (action, next) {
        var l, i;
        if (!roomName || action.to !== roomName || !action.user /*|| action.from == libsb.user.id*/ ) return next();

        function removeAndInsert(r, n, obj) {
            for (i = 0, l = lists["people" + r].length; i < l; i++) {
                if (lists["people" + r][i] && obj.id == lists["people" + r][i].id) {
                    lists["people" + r][i] = null;
                    break;
                }
            }
            if (!checkForUser(obj, lists["people" + n])) lists["people" + n].push(obj);
        }

        if (action.user.role == "follower") {
            action.user.status = "online";
            action.user.score = 4;
            removeAndInsert(1, 4, action.user);
        } else if (action.user.role == "owner") {
            action.user.status = "online";
            removeAndInsert(6, 9, action.user);
            action.user.score = 9;
        } else {
            action.user.status = "online";
            if (!checkForUser(action.user, lists.people3)) {
                lists.people3.push(action.user);
            }

            action.user.score = 3;
        }
        $people.reset();
        next();
    }, 1);

    // Set up infinite scroll here.
    $people.infinite({
        scrollSpace: 2000,
        fillSpace: 500,
        itemHeight: 100,
        startIndex: 0,
        getItems: function (index, before, after, recycle, callback) {
            var res = [],
                i, ppl = [],
                l, len, p, sum, isDone = false,
                count;
            if (!roomName) return callback([]);
            if (!index) {
                if (before) {
                    return callback([false]);
                }
                l = 9;
                p = 0;
                res.push(false);
            } else {
                l = (index * 10) % 10;
                p = Math.floor(index);
            }

            count = before || after;
            if (before) sum = -1;
            else sum = 1;
            while (l > 0 && l < 10) {
                if (sum > 0) {
                    i = p;
                    len = lists["people" + l].length;
                } else {
                    len = p;
                    i = lists["people" + l].length - 1;
                }
                for (; i < len && i >= 0; i += sum) {
                    if (lists["people" + l][i]) {
                        ppl.push(lists["people" + l][i]);
                    }
                    if (ppl.length === count) {
                        isDone = true;
                        break;
                    }
                }
                if (isDone) break;
                if (sum > 0) {
                    l = getNextArray(l);
                    p = 0;
                } else {
                    l = getPrevArray(l);
                    if (l) p = lists["people" + l].length - 1;
                }
            }
            if (index && after) ppl.splice(0, 1);
            if (l === 0) ppl.push(false);
            if (l === 10) ppl.unshift(false);
            ppl.forEach(function (e) {
                var index;
                if (e) index = (lists["people" + e.score].indexOf(e) + (e.score / 10));
                res.push(e && personEl.render(null, e, index));
            });
            callback(res);
        }
    });

    function resetMembers() {
        lists = {
            people1: [false],
            people3: [],
            people4: [],
            people6: [],
            people9: [false]
        };
    }
    
    function emptyList(){
        lists = {
            people1: [false],
            people3: [],
            people4: [],
            people6: [],
            people9: [false]
        };
        $people.reset();
    }

    function loadMembers() {
        resetMembers();
        getPeople(function () {
            $people.reset();
        });
    }
    libsb.on('navigate', function (state, next) {
		var reloadMembers = false, reset = false;
		
		if (state.source == 'people-area') return next();
		roomName = state.roomName;
		
		if (state.tab == "people") {
            $(".pane-people").addClass("current");
			reset = true;
        } else {
            $(".pane-people").removeClass("current");
        }
		
		if(!state.connectionStatus  && state.source == "boot") {
			emptyList();
			return next();
		}
        
		if(!state.old || state.roomName != state.roomName || state.old.connectionStatus != state.connectionStatus){
			reloadMembers = true;
		}
		
		if(reloadMembers) {
			loadMembers();
		}else if(reset) {
			$people.reset();
		}
		
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