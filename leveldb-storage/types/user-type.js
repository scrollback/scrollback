module.exports = function(store) {
	var user = store.defineType('user',{
		indexes: {
			createdOn: function(user, emit) {
				console.log("indexing based on.",user);
				emit(user.id, user.createdOn);
			}
		}
	});
	return user;
};