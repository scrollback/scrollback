/* jshint browser: true */
/* global $, libsb, lace, currentState */

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
            session: libsb.session,
            room: {
                id: currentState.room,
                description: '',
                params: {
                    irc: {},
                    http: {
                        seo: true
                    },
                    antiAbuse: {
                        offensive: true
                    }
                }
            },
            user: { id: libsb.user }
        };
        libsb.emit('room-up', roomObj,function(err, data){
             libsb.emit("navigate", {mode: 'normal', tab: 'info'}, function(){
                 location.reload();    
             });
        });
    });
    $("#login-and-create-room-button").click(function(){
       if ($("body").hasClass("role-guest")) {
           lace.modal.show({ body: $("#login-dialog").html() });
       }
    });
})();
