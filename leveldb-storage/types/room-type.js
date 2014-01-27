module.exports = function(store) {
	var room = store.defineType('room',{
		indexes: {
			id: function(room, emit) {
				emit(room.id);
			}
		}
	});
	return room;
};