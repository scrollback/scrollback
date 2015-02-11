var objUtils = require("../lib/obj-utils.js");
var store = {
    "nav": {
        "mode": "loading",
        "view": "main",
        "room": null
    },
    session:{
    },
    "user": {
    },
    "texts": {},
    "threads": {},
    entities:{},
    indexes:{
        textsById:{},
        threadsById:{},
        roomUsers:{},
        userRooms:{}
    }
};

function get() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(store);
    return objUtils.get.apply(null, args);
}


module.exports = function(core, config) {
    var state = {};
    
    state.get = get;
    state.getApp = function(){};
    state.getNav = function(){};
    state.getRooms = function(){};
    state.getUsers = function(){};
    state.getTexts = function(){};
    state.getEntity = function(){};
    state.getThreads = function(){};
    state.getContext = function(){};
    state.getRelatedRooms = function(){};
    state.getRelatedUsers =function(){};
    
//	require("./validation.js")(core, config, state);
    require("./state-manager.js")(core, config, state);
    require("./mock-socket.js")(core, config, state);
    
    return state;
};


