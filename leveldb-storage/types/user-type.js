module.exports = function(store) {
	var user = store.defineType('user',{
		indexes: {
			gatewayIdentity: function(user, emit) {
				user.identities && user.identities.forEach(function(identity) {
					var parts =  identity.split(":");
					emit(parts[0],parts[1]);
				});
			},
			createdOn: function(user, emit) {
				emit(user.createdOn);
			}
		}
	});
	return user;
};