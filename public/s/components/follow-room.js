/* jshint browser: true */
/* global $, libsb, lace */

$(function() {
	$(".follow-button").on("click", function() {
		if ($("body").hasClass("role-follower")) {
			libsb.part(window.currentState.room);
			$("body").removeClass("role-follower");
		} else {
			libsb.join(window.currentState.room);
			$("body").addClass("role-follower");
		}

		lace.animate.transition("grow", $(this));
	});
});

function getFollow(f,n){
    libsb.emit('getUsers', {memberOf: currentState.room, ref: libsb.user.id }, function(err, data){
        var user = data.results[0];
        if(user){
            var role = user.role;
            if(role == 'owner' || role == 'follower'){
                $('body').addClass('role-follower');
            }else{
                $('body').removeClass('role-follower');
            }
        }
     }); 
    if(n) n();
}

libsb.on("navigate", function(state,next){
    if(state.mode === "normal"){
        if(libsb.isInited){
            getFollow();
        }else {
            libsb.on('inited', getFollow);
        }
    }
    next();
});
