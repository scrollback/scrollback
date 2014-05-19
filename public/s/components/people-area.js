/* jshint jquery: true */
/* global libsb, personEl */
/* exported chatArea */

var peopleArea = {};

$(function() {
	var $people = $(".pane-people"),
		people = [];

		

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
				libsb.getMembers(room, function(err, p) {
					if(err) throw err;
					people = p.results;
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
