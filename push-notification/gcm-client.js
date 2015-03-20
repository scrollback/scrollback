/* jshint browser:true */
/* global Android */

module.exports = function(core, config, store) {
	console.log(config, store);
	
	core.on("boot", function(state, next) {
		if(state.context.env === "android") {
			Android.registerGCM();
			window.addEventListener("gcm_register", function(event) {
				console.log("Got event", event);
			});
		}
		next();
	}, 100);
	
	
	core.on("init-dn", function(action, next) {
		next();
	}, 100);
	
};