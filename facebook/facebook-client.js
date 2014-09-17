/*jshint browser:true*/
/*global libsb, $*/
var config = require("../client-config.js");

function getParameterByName(name, url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

libsb.on('auth-menu', function(menu, next){
	menu.buttons.facebook = {
		text: 'Facebook',
		prio: 100,
		action: function(){
		//window.open(location.protocol + "//" + location.host + "/r/facebook/login", '_blank', 'toolbar=0,location=0,menubar=0');	
            var fbRef = window.open("https:" + config.server.host + "/r/facebook/login", "_blank", "location=yes");
			fbRef.addEventListener('loadstop', function (event) {
				var url = event.url;
				var code = getParameterByName('code', url);
				if (code !== null) {
					var auth = {
						command: "signin",
						auth: {
							facebook:{
								code: code
							}
						}
					};
					$(window).trigger("phonegapmsg", [auth]);
					fbRef.close();
				}
			});
			fbRef.addEventListener('loaderror', function (event){
				console.log("got load error ", event);
			});
			fbRef.executeScript({code: "return window.location"}, function(ret) {
				console.log(ret);
			});
		}
	};
	next();
}, 1000);
