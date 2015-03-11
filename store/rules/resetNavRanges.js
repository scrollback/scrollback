module.exports = function (core, config, store) {
	core.on('boot', handle, 100);
	core.on('setstate', handle, 100);

	function handle(changes, next) {
		var mode;

		if(changes.nav && (changes.nav.mode || changes.nav.room || changes.nav.thread)) {
			mode = changes.nav.mode || store.getNav().mode;
			if(mode == 'room') {
				changes.threadRange = changes.threadRange || {time: null, before: 25};
			} else if(mode == 'chat') {
				changes.textRange = changes.textRange || {time: null, before: 25};
			}
		}
		next();
	}
};
