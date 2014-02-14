module.exports = function(store) {
	var user = store.defineType('label',{
		indexes: {
			id: function(data, emit) {
				emit(data.id);
			}
		}
	});
	return user;
};
