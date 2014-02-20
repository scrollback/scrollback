
module.exports = function(core) {
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
}