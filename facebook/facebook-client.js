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
//			fbRef.addEventListener('loadstop', function (event) {
//				var url = event.url;
//				var code = getParameterByName('code', url);
//				if (code !== null) {
//					var auth = {
//						command: "signin",
//						auth: {
//							facebook:{
//								code: code
//							}
//						}
//					};
//					$(window).trigger("phonegapmsg", [auth]);
//					fbRef.close();
//				}
//			});
//			
//			fbRef.addEventListener('loaderror', function (event){
//				console.log("got load error ", event);
//			});
			console.log("fbreaf is ", fbRef);
			var interval = setInterval(function () {
				console.log("*****************");
				fbRef.executeScript({code: "window.location.href;"}, function(ret) {
					var url = ret[0];
					console.log("return value", ret[0]);
					var code = getParameterByName('code', url);
					if (code !== null) {
						var auth = {
							command: "signin",
							auth: {
								facebook: {
									code: code
								}
							}
						};
						console.log("got auth ", auth);
						$(window).trigger("phonegapmasg", [auth]);
						clearInterval(interval);
						fbRef.close();
					}
				});
			}, 100);
		}
	};
	next();
}, 1000);
