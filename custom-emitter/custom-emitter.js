module.exports = function(core) {
	core.on('message', function(message, next) {
		core.emit(message.type, message, next);
	}, 'watchers');
}
