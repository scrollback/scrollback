/*jshint browser:true*/
/*global libsb*/

libsb.on('auth-menu', function(menu, next){
	menu.buttons.facebook = {
		text: 'Facebook',
		prio: 100,
		action: function(){
//			var facebookRef = window.open(location.protocol + "//" + location.host + "/r/facebook/login", '_blank', 'toolbar=0,location=0,menubar=0');
			var ref = navigator.app.loadUrl(location.protocol + "//" + location.host + "/r/facebook/login", {openExternal: true});
			ref.addEventListener('loadstop', function () {
				ref.executeScript({
					code: "function() {alert('hey :)');} "
				});
			});	
		}
	};
	next();
}, 1000);