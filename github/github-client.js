/* jshint browser: true */
/* global libsb */
libsb.on('user-menu', function(menu, next){
	menu.items.reportissue = {
		text: 'Report Issue',
		prio: 600,
		action: function(){
			window.open('https://github.com/scrollback/scrollback/issues');
		}
	};
	next();
}, 1000);