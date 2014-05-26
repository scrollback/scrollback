(function(){ 
    libsb.on('error-dn', function(err, data){
        if(err.message === "NO_ROOM_WITH_GIVEN_ID"){
            libsb.emit("navigate", {mode:'noroom'});
        }
    });
    $("#create-room-button").click(function(){
        var roomObj = {
            id: generate.uid(), 
            type: 'room', 
            to: currentState.room,
            room: { 
                id: currentState.room, 
                description: '', 
                params: {
                    irc: {},
                    allowSEO: true,
                    wordban: false 
                } 
            }, 
            user: { id: libsb.user } 
        }; 
        libsb.emit('room-up', roomObj,function(err, data){
           libsb.emit("navigate", {mode: 'normal', tab: 'info'});
        });
    });
    $("#login-and-create-room-button").click(function(){
        libsb.emit("navigate", {mode: 'normal'});
    });
})();
