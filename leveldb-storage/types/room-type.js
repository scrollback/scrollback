module.exports = function(store) {
	var room = store.defineType('room',{
		indexes: {
			createdOn: function(room, emit) {
				console.log("inserting room", room);
				emit(room.createdOn);
			},
			gatewayIdentity: function(room, emit) {
				room.identities && room.identities.forEach(function(identity) {
					//fix this inconsistancy.
					var parts =  identity.split(":");
					emit(parts[0],parts[1]);
				});
			}
		}
	});
	return room;
};