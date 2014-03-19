function validateRoom(r, santize) {
	var room = r;
		room = room.trim();
		room = room.replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");
		if(room=='img'||room=='css'||room=='sdk') room = "scrollback";
		if(!room) { room = "scrollback";}
		else{
			if(room.length<3) room=room+Array(4-room.length).join("-");	
		}
		if(santize) return room;
		else return room === r;
};