module.exports = function(r, santize){
	var room;
    if(typeof r !== 'string') r = "";
    room = r;
    room = room.toLowerCase();
    room = room.trim();
    var t = room.replace(/^[0-9]*/, "");
    if (t === "") room = "";
    room = room.replace(/[^a-z0-9]/g,"-").replace(/^-+|-+$/,"");
    if(room=='img'||room=='css'||room=='sdk') room = "scrollback";
    if(!room) { room = "scrollback";}
    else{
        if(room.length<3) room=room+Array(4-room.length).join("-");	
    }
    room = room.substring(0,32);
    if(santize) return room;
    else return room === r;
};