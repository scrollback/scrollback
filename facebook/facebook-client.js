/*jshint browser:true*/
/*global libsb*/

libsb.on('auth-menu', function(menu, next){
	menu.buttons.facebook = {
		text: 'Facebook',
		prio: 100,
		action: function(){
		//window.open(location.protocol + "//" + location.host + "/r/facebook/login", '_blank', 'toolbar=0,location=0,menubar=0');	
            window.fbref = window.open("https://dev.scrollback.io/r/facebook/login", "_blank", "toolbar=0,location=0,menubar=0");
            alert("window is oepned");
		}
	};
	next();
}, 1000);
