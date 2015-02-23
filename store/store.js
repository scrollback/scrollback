var objUtils = require("../lib/obj-utils.js");
var generate = require("../lib/generate.js");
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
    state.getTexts = function(roomid) {
        var res = [];
        for(var i =0;i<100;i++) {
            res.push(createText(roomid));
        }
        res.sort(function(a,b) {
            return a-b;
        });
        return res;
    };
    state.getEntity = function(){};
    state.getThreads = function(roomid) {
        var res = [];
        for(var i =0;i<100;i++) {
            res.push(createThread(roomid));
        }
        res.sort(function(a,b) {
            return a-b;
        });
        return res;
    };
    state.getContext = function(){};
    state.getRelatedRooms = function(){};
    state.getRelatedUsers =function(){};
    
//	require("./validation.js")(core, config, state);
    require("./state-manager.js")(core, config, state);
    require("./mock-socket.js")(core, config, state);
    
    return state;
};

function createThread() {
    var time = new Date().getTime() - 1000000;
    var threads = {
        id: generate.uid(),
        title: generate.sentence(((Math.random() + 1) * 10 )| 0),
        startTime: time + (((Math.random() + 1) * 10000 )| 0)
    };
    createText();
    return threads;
}


function createText(room) {
    var time = new Date().getTime() - 1000000;
    var action = {
        id: generate.uid(),
        to: room,
        type:"text",
        threads:[{
            id:generate.uid(),
            title: generate.sentence(((Math.random() + 1) * 10 )| 0),
            startTime: time + (((Math.random() + 1) * 10000 )| 0)
        }],
        from: generate.names(12),
        text: generate.sentence(((Math.random() + 1) * 10 )| 0),
        time: time + (((Math.random() + 1) * 10000 )| 0)
    };
    return action;
}
