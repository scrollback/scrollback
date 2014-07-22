/* jshint browser: true */
/* global window*/


var currentState =  window.currentState;

module.exports = function(libsb) {
	libsb.on("navigate", function(state, n) {
        
        function next() {
            console.log("Calling next: ");
            n();
        }
        
		if(!state.old || state.roomName != state.old.roomName) {
			libsb.getRooms({ref: state.roomName}, function(err, data) {
                console.log("-----getRooms----- came back");
				if(err) {
                    console.log("ERROR: ", err, data);
					throw err; // handle this better
				}
				if(!data || !data.results || !data.results.length) {
					state.room = null;
                    currentState.room = null; // this is a bad thing to do..     
				}else{
					state.room = data.results[0];
                    currentState.room = state.room; // so is this... fix it.
                    
				}
				next();
			});
		}else {
            state.room = currentState.room;
			next();
		}
	}, 999);
};