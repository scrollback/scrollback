module.exports = function(store) {
	var user = store.defineType('user',{
		indexes: {
			gatewayIdentity: function(user, emit) {
				user.accounts.forEach(function(account) {
					var parts =  account.id.split(":");
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