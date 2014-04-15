module.exports = function(store) {
	return store.defineType('thread',{
		indexes: {
			tostarttime: function (thread, emit) {
				emit(thread.to, -thread.startTime);
			},
			toendtime: function (thread, emit) {
				emit(thread.to, -thread.endTime);
			},
		}
	});
};
