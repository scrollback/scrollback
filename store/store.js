var state, options;
module.exports = function(core, config) {
    state = {
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

    options = {
        state: state
    };

	core.state = state; // replace this with window.state = state;
	require("./validation.js")(core, config);
};