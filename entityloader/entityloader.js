
/* list of event that the basic validation function is called for.*/
var events = ['text', 'edit', 'join', 'part', 'away', 'admit', 'expel', 'room'];

/* if few more validtion is to be added for to any event add it to this list. eq:
	var handlers = {
		'init': function(action, callback){
			callback();
		}
	};
*/
var handlers = {
	edit: function(action, callback) {
		core.emit("getTexts", {id: action.ref}, function(err, actions) {
			if(err || !actions.results.length) return callback(new Error("TEXT_NOT_FOUND"));
			action.old = actions.results[0];
			callback();
		});
	},
	room: function(action, callback) {
		core.emit("getRooms", {id: action.to}, function(err, actions) {
			if(err) return callback(err);
			if(!actions.results.length) {
				action.old = {};
			}else {
				action.old = actions.results[0];
			}
			callback();
		});
	}
};

module.exports = function(core) {
	events.forEach(function(event) {
		core.on(event, function(action, callback) {
			basicLoader(action, function(err) {
				if(err) return callback(err);
				if(handlers[event]) handlers[event](action, callback);
				else callback();
			})
		}, "loader");
	});
}



function basicLoader(action, callback) {
	var wait = true, isErr = false;

	core.emit("getUsers",{id: action.from},function(err, users) {
		if(err || !user.length) {
			isErr = true;
			return callback(new Error("USER_NOT_FOUND"));
		}
		if(isErr) return;
		action.user = users[1];
		if(wait) wait = false;
		else callback();
	});
	
	core.emit("getRooms",{id: action.to}, function(err, rooms) {
		if(err || !rooms.length) {
			isErr = true;
			return callback(new Error("ROOM_NOT_FOUND"));
		}
		if(isErr) return;
		action.room = users[1];
		if(wait) wait = false;
		else callback();
	});
}

/*module.exports = function(core) {
	function loader(data, callback) {
		//core.emit('getRooms', {id: data.from}, function(err, user) {
		if(data.to){
			core.emit('getRooms', {id:data.to[0]}, function(err, room) {
				if(err) callback(err);
				data.room = room[0] || {};
				//core.emit('getUsers', {id: data.from}, function(err, user) {
				if(data.type == "nick") return callback();
				core.emit('getUsers', {id: data.from}, function(err, user) {
					if(err) callback(err);
					data.user = user[0] || {};
					callback(null, data);
				});
			});
		}else{
			callback();
		}
	
	}

	core.on('edit', function(data, callback) {
		loader(data, function(err, data){
			core.emit("messages", {id: data.ref}, function(err, old) {
				if(!old || old.length==0) return callback(new Error("INVALID REF"));
				data.old = old[0];
				callback(null, data);
			});		
		});
	},'loader');
	core.on('message', loader, 'loader');
	core.on('text', loader, 'loader');
	core.on('away', loader, 'loader');
	core.on('back', loader, 'loader');
	core.on('join', loader, 'loader');
	core.on('part', loader, 'loader');
	core.on('admit', loader, 'loader');
	core.on('expel', loader, 'loader');
	// core.on('user', loader, 'loader');
	// core.on('init', loader, 'loader');
}*/