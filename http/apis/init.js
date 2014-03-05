module.exports = function(core) {
	return function(init, cb) {
		core.emit('init', cb);
	}
};