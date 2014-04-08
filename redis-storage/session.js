var config = require("../config.js");
var get = require("./get.js");
var put = require("./put.js");

module.exports = function(core) {
	// core.on("getUsers", function(query, callback){
	// 	if(query.ref && query.ref == "me") {
	// 		get("session",query.session, function(err, sessionObj) {
	// 			query.results = [];
	// 			/*should probably think of a way to change this.
	// 			if for some reasons redis is working and it throws an error. */
	// 			if(err || !sessionObj) return callback();
	// 			if(sessionObj.user) {
	// 				get("user",sessionObj.user, function(err, user) {
	// 					if(err) return callback();
	// 					try{
	// 						user = JSON.parse(user);
	// 					}catch(e) {
	// 						return callback();
	// 					}
	// 					query.results = [user];
	// 					callback();
	// 				})
	// 			}else {
	// 				callback();
	// 			}
	// 		});
	// 	}
	// }, "storage");
	// core.on("room", function(action, callback) {
	// 	roomDB.put("room:{{"+action.room.id+"}}", JSON.stringify(action.room));
	// 	callback();
	// }, "storage");
	// core.on("user", function(action, callback) {
	// 	userDB.put("user:{{"+action.user.id+"}}", JSON.stringify(action.user));
	// 	callback();
	// }, "storage");

	core.on('getSessions', function(action, callback) {
		get("session",action.ref, function(err, sessionObj) {
			var session = {
				id: action.session,
				user: action.user.id,
				origin: action.origin
			};
		});
	});
	core.on("init", function(action, callback) {
		get("session",action.session, function(err, sessionObj) {
			var session = {
				id: action.session,
				user: action.user.id,
				origin: action.origin
			};
			if(err){

			}else{
				if(sessionObj && sessionObj.origin && sessionObj.origin.locations) {
					Object.keys(sessionObj.origin.locations).forEach(function(resource) {
						if(session.origin && session.origin.locations){
							session.origin.locations[resource] = sessionObj.origin.locations[resource]	
						}
					});
				}
					
			}
			put("session",action.session,session);
			callback();
		});
	},"storage");
};


/* delete when the time is right. ;)
	sample objects
	{
		id: "web:192.168.0.1:scrollback_SID:aocjsncaosmca;lsdmfnasjdvknasd;lfkm",
		user: "guest-harish",
		origin:{
			gateway: "web",
			client: "192.168.0.1",
			locations: {
				"resourceID1" : "https://mozillaindia.org/home.html",
				"resourceID2" : "https://jfdi.org"
			}
		}
	}

	{
		id: "irc://irc.freenode.net/xzntric",
		user: "guest-xzntric",
		origin:{
			gateway: "irc",
			server: "irc.freenode.net",
			client: "192.168.0.1"
		}
	}

*/