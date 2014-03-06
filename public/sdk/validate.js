function validateRoom(r, santize) {
	function validate(room) {
		return (room.match(/^[a-z][a-z0-9\_\-\(\)]{2,32}$/i)?
	        room!='img'&&room!='css'&&room!='sdk':false);
	}
	var valid = validate(r), room = r;
		room = room.trim();
		room = room.replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");
		if(!room) { room = "scrollback";}
		else{
			if(room.length<3) room=room+Array(4-room.length).join("-");	
		}
		if(santize) return room;
		else return room === r;
};


