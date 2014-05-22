var assert = require('assert');
var core = require('../lib/emitter.js');
var generate = require("../lib/generate.js");
require("./leveldb-storage.js")(core);

core.emit("user", {
	id: generate.uid(),
	type:"user",
	user: {
		id:"kamal",
		description: generate.sentence(4),
		type:"user",
		picture:"http://gravatar.com/avatar/alscalladf",
		identities:["mailto:kamal@scrollback.io"], 
		params:{},
		timezone: 60
	}
});

core.emit("user", {
	id: generate.uid(),
	type:"user",
	user: {
		id:"testuser2",
		description: generate.sentence(4),
		type:"user",
		picture:"http://gravatar.com/avatar/alscalladf",
		identities:["mailto:kamal@sb.lk"], 
		params:{},
		timezone: 90
	}
});

core.emit("room", {
	id: generate.uid(),
	type:"room",
	room: {
		id:"testroom1",
		description: generate.sentence(4),
		type:"room",
		params:{
		}
	},
	user: {
		id:"amalantony",
	}
});


core.emit("room", {
	id: generate.uid(),
	type:"room",
	room: {
		id:"scrollback",
		description: generate.sentence(4),
		type:"room",
		params:{
			irc: {
				server: "dev.scrollback.io",
				channel: "#scrollback",
				enabled: true,
				pending: false
			}
		},
		identities: ["irc://dev.scrollback.io/#scrollback"]
	},
	user: {
		id:"kamal"
	}
});




core.emit("room", {
	id: generate.uid(),
	type:"room",
	room: {
		id:"testroom2",
		description: generate.sentence(4),
		type:"room",
		params:{openFollow: false, readLevel: "guest", writeLevel: "follower"}
	},
	user: {
		id:"testuser2",
	}
});


//core.emit("join", {
//	id: generate.uid(),
//	type:"join",
//	room: {
//		id:"testroom2",
//		description: generate.sentence(4),
//		type:"room",
//		params:{openFollow: false, readLevel: "guest", writeLevel: "follower"}
//	},
//	user: {
//		id:"testuser1",
//	},
//	role: "follower"
//});

//core.emit("join", {
//	id: generate.uid(),
//	role:"follower",
//	to: "scrollback",
//	from:"kamal",
//	type:"join",
//	session:generate.uid(),
//	resource:generate.uid(),
//	user:{id:"kamal"},
//	room:{id:"scrollback"}
//}, function(err, data){
//	if(err) throw err;
//	
//});