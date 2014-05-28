/* jshint jquery: true */
/* global libsb, personEl */
/* exported chatArea */

var peopleArea = {};

$(function() {
	var $people = $(".pane-people"), shown = false, room = "",
		people = [];
	var lists = {
		people1: [],
		people3: [],
		people4: [],
		people6: [],
		people9: []
	}

	function getPeople(callback) {
		var ppl = {}, sorted = [];
		libsb.getUsers({memberOf: currentState.room}, function(err, res) {
			var r = res.results, i, l;
			for(i=0, l=r.length; i<l; i++) {
				ppl[r[i].id] = r[i];
				if(r[i].role == "owner") ppl[r[i].id].score = 6;
				else ppl[r[i].id].score = 1;
			}
			libsb.getUsers({occupantOf: currentState.room}, function(err, res) {
				var r = res.results, i, l;
				for(i=0, l=r.length; i<l; i++) {
					if(ppl[r[i].id]) {
						ppl[r[i].id].score += 3;
					}else {
						ppl[r[i].id] = r[i];	
						ppl[r[i].id].score = 3;
					}
				}
				Object.keys(ppl).forEach(function(e) {
					sorted.push(ppl[e]);
				});
				sorted.sort(function(a,b) {
					return -(a.score-b.score);
				});
				sorted.forEach(function(e) {
					lists["people"+e.score].push(e);
				});
				lists["people1"].unshift(false);
				lists["people9"].push(false);
				callback(lists);
			});
		});
	}

	// Set up infinite scroll here.
	$people.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 100,
		startIndex: 0,
		getItems: function (index, before, after, recycle, callback) {
			var res = [], i, ppl = [], l,len, p, t, sum, isDone = false;
			if(!index) {
				if(before) {
					return callback([false]);
				}
				l = 9, p=0;
				res.push(false);
			} else{
				l = (index*10)%10;
				p = Math.floor(index);
			}

			count = before || after;
			if(before) sum = -1;
			else sum = 1;

			while(l>0 && l<10) {
				if(sum>0) { i=p, len=lists["people"+l].length; }
				else{ len=p, i=lists["people"+l].length-1; }
				for(; i<len && i>=0; i+=sum) {
					if(lists["people"+l][i]) {
						ppl.push(lists["people"+l][i]);
					}
					if(ppl.length === count) {
						isDone = true;
						break;
					}
				}
				if(isDone) break;
				if(sum>0) l = getNextArray(l);
				else l = getPrevArray(l);
			}
			if(index && after) ppl.splice(0, 1);
			if(l == 0) ppl.push(false);
			if(l==10) ppl.unshift(false);
			ppl.forEach(function(e) {
				var index;
				if(e)index = (lists["people"+e.score].indexOf(e)+(e.score/10));
				res.push(e && personEl.render(null, e, index));
			});

			callback(res);
		}
	});
	
	libsb.on('navigate', function(state, next) {
		if(state.tab == "people") {
			$(".pane-people").addClass("e && current");
		}else{
			$(".pane-people").removeClass("current");			
		}
		
		if(state.source == 'people-area') return next();

		if(state.tab == "people" && state.room != room) {
			room = state.room;
			function loadMembers(p,n) {
				getPeople(function(sortedList) {
					people = sortedList;
					$people.reset();
				});
				if(n) n();
			}
			
			if(libsb.isInited) {
				loadMembers();
			}else{
				libsb.on("inited", loadMembers, 1000);
			}
			$people.reset();
			room = state.room;
		}

		next();
	});

	peopleArea.setBottom = function(bottom) {
		var atBottom = ($people.scrollTop() + $people.height() == $people[0].scrollHeight);

		$people.css({ bottom: bottom });
		if(atBottom) $people.scrollTop($people[0].scrollHeight);
	};

	peopleArea.setRoom = function(r) {
		room = r;
		$people.reset();
	};
});


function getNextArray(l){
	if(l === 1) return 0;
	if(l === 3) return 1;
	if(l === 4) return 3;
	if(l === 6) return 4;
	if(l === 9) return 6;
	else return 0;
}
function getPrevArray(l){
	if(l === 1) return 3;
	if(l === 3) return 4;
	if(l === 4) return 6;
	if(l === 6) return 9;
	if(l === 9) return 10;
	else return 0;
}