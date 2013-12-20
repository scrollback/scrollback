//test this script. dont want to mess up the db on production.....

var core = Object.create(require("../lib/emitter.js")), config = require("../config.js");
var crypto = require('crypto');
var pluginList = ["rooms","room","members"];
function start(name) {
	var plugin = require("../"+name+"/"+name+".js");
	plugin(core);
}

pluginList.forEach(function(name) {
	start(name);
});

core.emit("rooms",{query:"",type:"user",fields:["accounts"]}, function(err, data) {
	data.forEach(function(element){
		if(element.accounts && element.accounts) {
			element.picture =  (element.accounts && element.accounts[0])? element.accounts[0].id.substring(7) : "guest@scrollback";
	        element.picture = crypto.createHash("md5").update(element.picture).digest("hex");
	        element.picture = '//s.gravatar.com/avatar/'+element.picture;
	        element.accounts && delete element.accounts;	
		}
		core.emit("room",element);
	});
});