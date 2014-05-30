module.exports =function() {
	$(function(){
		var path  = window.location.pathname.substr(1);
		var search = window.location.search.substr(1), properties={};
		var state = {};
		path = path.split("/");
		state.source = "init";
		
		search.split("&").map(function(i) {
			var q;
			if(!i) return;
			q = i.split("=");
			state[q[0]] = q[1];
		});

		if(!state.mode) state.mode = "normal";
		if(!state.tab) state.tab = "people";
		if(!state.theme) state.theme = "light";
		if(!state.embed) state.embed = "";

		if(state.time) {
			state.time = new Date(state.time).getTime();
		}

		if(path[0] == "me") {
			state.mode = "pref"
			libsb.emit("navigate", state);
			return;
		}else {
			state.room = path[0]
			state.room = state.room.toLowerCase();
		} 

		if(path[1] == "edit") {		
			state.mode = "conf"
			libsb.emit("navigate", state);
		}else if(path[1]) {
			state.thread = path[1] || "";
		}
		libsb.emit("navigate", state);
	});
};