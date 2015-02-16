var ebus = require("ebus");
var core = new ebus();

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
console.log(state, core);
/*

var options = {
    state: state;
};
*/

//require("../nav-manager.js")(core, {}, options);
//require("../state-manager.js")(core, {}, options);

