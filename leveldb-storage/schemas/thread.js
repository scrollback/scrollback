module.exports = function(types) {
	return {
		put : function(data, cb) {
			types.thread.put(data);
		}
	}
};
