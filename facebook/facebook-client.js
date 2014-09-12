/*jshint browser:true*/
/*global libsb*/

libsb.on('auth-menu', function(menu, next){
	menu.buttons.facebook = {
		text: 'Facebook',
		prio: 100,
		action: function(){
//			var facebookRef = window.open(location.protocol + "//" + location.host + "/r/facebook/login", '_blank', 'toolbar=0,location=0,menubar=0');
			var a  = navigator.app.loadUrl(location.protocol + "//" + location.host + "/r/facebook/login", {openExternal: true});
			a.close();
		}
	};
	next();
}, 1000);