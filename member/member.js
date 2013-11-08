var log = require("../lib/logger.js");
var config = require('../config.js');
var db = require('../core/data.js');
/**
Process join and part massages
*/
module.exports = function(core) {
	core.on('message', function(message, callback) {
		if(message.type && (message.type==="join"||message.type=="part") && message.from.indexOf('guest-')!==0){
			var part = message.type==="join"?null: new Date().getTime();
			db.query("INSERT INTO scrollback.members(`user`, `room`, `joinedOn`, `partedOn`)" +
					" VALUES (?) ON DUPLICATE KEY UPDATE partedOn=values(`partedOn`)",
					[[message.from , message.to , new Date().getTime(), part]],function(v){
						log("---error--",v);
			});
		}
		callback();
	}); 
};




