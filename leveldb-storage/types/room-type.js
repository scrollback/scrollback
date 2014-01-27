module.exports = function(store) {
	var room = store.defineType('room',{
		indexes: {
			createdOn: function(room, emit) {
				emit(room.createdOn);
			},
			gatewayIdentity: function(room, emit) {
				room.accounts && room.accounts.forEach(function(account) {
					//fix this inconsistancy.
					var parts =  account.id.split(":");
					emit(parts[0],parts[1]);
				});
			}
		}
	});
	return room;
};