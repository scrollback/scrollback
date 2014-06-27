/* global libsb*/
libsb.on('user-menu', function(menu, next){
	menu.items.logout = {
		text: 'Logout',
		prio: 1000,
		action: function(){
			libsb.logout();
		}
	};
	next();
}, 1000);