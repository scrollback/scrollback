/* jshint jquery: true */
/* global libsb, roomEl */
/* exported chatArea */

// var roomList = {};
$(function() {
	var $roomlist = $(".room-list");
		window.rooms = [false, false];

	function enter(room) {
		if(rooms.indexOf(room)<0) {
			rooms.pop();
			rooms.push(room);
			rooms.push(false);
			libsb.enter(room);
			$roomlist.reset();
		}
	}

	// Set up infinite scroll here.
	$roomlist.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 100,
		startIndex: 0,
		getItems: function (index, before, after, recycle, callback) {
			var res = [], i;
			console.log("++++++++++++=roomslist", rooms,index, before, after);
			if(!index) index = 0;
			if(before) {
				if(index === 0){
					return callback([]);
				}
				index--;
				from = index - before;
				if(from <0) {
					to = from+before;
					from = 0;
				}else {
					to = index;
				}
			}else {
				if(index){
					index++;
				}else{
					after++;
				}
				from = index;
				to = index+after;
			}
			for(i=from;i<=to;i++) {
				if(typeof rooms[i] !== "undefined") res.push(rooms[i]);
			}


			/*
			for(i=index+1-before; i<=index+after; i++) {
				if(i<0) { res.push(false); i=0; }
				// if(i==index) continue;
				if(i>rooms.length-1) { res.push(false); break; }
				res.push(roomEl.render(null, rooms[i], i));
			}*/

			callback(res.map(function(r) {
				return r && roomEl.render(null, r, rooms.indexOf(r));
			}));
		}
	});
	// Set up a click listener.,
	$roomlist.click(function(event) {
		var $el = $(event.target).closest(".room-item");
		if(!$el.size()) return;

		libsb.emit('navigate', {
			room: $el.attr("id").split('-')[2],
			view: 'normal', source: 'room-list',
			mode: "normal",
			view: "normal",
			query: "",
			tab:"people",
			thread: null
		});

		event.preventDefault();
	});


	libsb.on("navigate", function(state, next) {
		var room = state.room;
		enter(room);
		/*if(room && rooms.indexOf(room)<0) {
			function back(){
				rooms.push(room);
				libsb.enter(room);
			}
			if(libsb.isInited){
				back();
			}else{
				libsb.on("inited", back);
			}
		}
		*/
		$roomlist.reset();
		next();
	});
	libsb.on("init-dn", function(init, next) {
		if(init.occupantOf){
			init.occupantOf.forEach(function(r) {
				enter(r.id);
				/*if(rooms.indexOf(r.id)<0) {
					rooms.push(r.id);
					libsb.enter(r.id);
				}*/
			});
		}
		if(init.memberOf){
			init.memberOf.forEach(function(r) {
				if(rooms.indexOf(r.id)<0) {
					enter(room);
				}
			});
		}
		$roomlist.reset();
		next();
	}, 10);

});
