var ebus = require("ebus");
var core = new ebus();

var listeners = {
	onBoot: [],
	onChange: []
};
var state = {
    "nav": {
        "mode": "loading",
        "view": "main",
        "room": null
    },
    session:{
    },
    "user": {
    },
    "content": {},
    entities:{},
    indexes:{
        textsById:{},
        threadsById:{},
        roomUsers:{},
        userRooms:{}
    }
};

var options = {
    state: state;
};

require("./validation.js")(core, {}, options);