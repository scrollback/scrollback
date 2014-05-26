/* jshint jquery: true */
/* global libsb, personEl */
/* exported chatArea */

var peopleArea = {};

$(function() {
	var $people = $(".pane-people"),
		people = [];

	function getPeople(callback) {
		var ppl = {}, sorted = [];
		libsb.getUsers({memberOf: currentState.room}, function(err, res) {
			var r = res.results, i, l;
			console.log(r);
			for(i=0, l=r.length; i<l; i++) {
				ppl[r[i].id] = r[i];
				if(r[i].role == "owner") ppl[r[i].id].score = 3;
				else ppl[r[i].id].score = 1;
			}
			console.log(ppl);
			libsb.getUsers({occupantOf: currentState.room}, function(err, res) {
				var r = res.results, i, l;
				for(i=0, l=r.length; i<l; i++) {
					if(ppl[r[i].id]) {
						ppl[r[i].id].score += 1.5;
					}else {
						ppl[r[i].id] = r[i];	
						ppl[r[i].id].score = 1.5;
					}
				}
				console.log(ppl);
				Object.keys(ppl).forEach(function(e) {
					sorted.push(ppl[e]);
				});
				console.log(sorted);
				sorted.sort(function(a,b) {
					return -(a.score-b.score);
				});
				callback(sorted);
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
			var res = [], i;

			for(i=index-before; i<=index+after; i++) {
				if(i<0) { res.push(false); i=0; }
				if(before && i==index) continue;
				if(i>people.length-1) { res.push(false); break; }
				res.push(personEl.render(null, people[i], i));
			}

			callback(res);
		}
	});
	
	libsb.on('navigate', function(state, next) {
		if(state.tab == "people") {
			$(".pane-people").addClass("current");
		}else{
			$(".pane-people").removeClass("current");			
		}
		
		if(state.source == 'people-area') return next();

		if(!state.old ||(state.tab == "people" && state.old.tab!="people") || (state.old.room != state.room)) {
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