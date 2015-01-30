var config;
/********remove this after testing.**********/
var state = {
    nav:{},
    content:{},
    context:{},
    user:{},
    entities:{},
    sessions:{}
};
/******************/

module.exports = function(core, conf) {
    config = conf;   
    core.on("setState", function(newState, next) {
        /*
            loadContent to store if needed
            check store, if the data is not there, make query for 256 and add that to the textContent.
        */
        compare(newState);
        next();
    }, 999);
    
    function compare(newState) {
        Object.keys(newState).forEach(function(e) {
            if(state[e]!=newState[e]) {
                newState.changes[e] = newState[e];
            }
        });
    }
};