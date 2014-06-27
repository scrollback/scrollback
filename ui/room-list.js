/* jshint jquery: true */
/* global libsb, currentState */

var roomEl = require("./room-item.js"),
	roomName = "";

// var roomList = {};
var $roomlist, rooms = [false, false], listenQueue = [];

function enter(room) {
    if(!room) return;
    room = room.toLowerCase();
    if(rooms.indexOf(room)<0) {
        if(libsb.isInited) {
            libsb.enter(room);
            rooms.pop();
            rooms.push(room);
            rooms.push(false);
        }else {
            if(listenQueue.indexOf(room)<0){
                listenQueue.push(room);
            }
        }
        if($roomlist) $roomlist.reset();
    }
}
libsb.on("inited", function(d, n) {
    if(currentState.embed == "toast") return n();

    listenQueue.forEach(function(e) {
        enter(e);
    });

    listenQueue = [];
    n();
}, 100);


libsb.on("navigate", function(state, next) {
    var room = state.roomName;
    if(currentState.embed == "toast") return next();
    enter(room);
    if(state.old && state.old.roomName === state.roomName) return next();
    next();
}, 10);

libsb.on("init-dn", function(init, next) {
    if(currentState.embed == "toast") return next();
/*	if(init.occupantOf){
        init.occupantOf.forEach(function(r) {
            enter(r.id);
        });
    }*/
    if(init.memberOf){
        init.memberOf.forEach(function(r) {
            enter(r.id);
        });
    }
    next();
}, 10);

$(function() {
	$roomlist = $(".room-list");    
	// Set up infinite scroll here.
	$roomlist.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 100,
		startIndex: 0,
		getItems: function (index, before, after, recycle, callback) {
			var res = [], i, from, to;
			if(!index) index = 0;
			if(before) {
				if(index === 0){
					return callback([false]);
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
			roomName: $el.attr("id").replace(/^room-item-/, ""),
			view: 'normal',
            source: 'room-list',
			mode: "normal",
			query: "",
			tab:"people",
			thread: null,
            time: 0
		});

		event.preventDefault();
	});

});
