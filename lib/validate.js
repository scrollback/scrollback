module.exports = function(r, santize){
	var room;
    if(!r) r = "";
    room = r;
    room = room.toLowerCase();
    room = room.trim();
    room = room.replace(/[^a-zA-Z0-9]/g,"-").replace(/^-+|-+$/,"");
    if(room=='img'||room=='css'||room=='sdk') room = "scrollback";
    if(!room) { room = "scrollback";}
    else{
        if(room.length<3) room=room+Array(4-room.length).join("-");	
    }
    room = room.substring(0,32);
    if(santize) return room;
    else return room === r;
};