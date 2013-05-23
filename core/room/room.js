// imports
var core=require(process.cwd()+"/core/core.js");


var getRoom=function(room){
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.get", room);	
}.async();
exports.getRoom=getRoom;

var createRoom=function(room){
	if(isEmpty(room.id)  && isEmpty(room.type))
		throw new Error("the id or type of a room cannot be empty");
	if(getRoom({id:room.id}).length !== 0)
		throw new Error("Room already exist");
	var newRoom={
		id:room.id,
		name:room.name || "",
		type:room.type,
		picture:room.picture||"http://askabt.com/img/userm128.png",
		description:room.description||"User on scrollback.io",
		ownerId:room.id,
		createdAt:new Date(),
		present:0
	};

	return core.db.execute("room.create",newRoom);
}.async();
exports.createRoom=createRoom;

/*
function deleteRoom(room) {
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.delete", room);
}


function getListeners(room) {
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.getListeners", room);
}

function getListening(room) {
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.getListening", room);
}

function getRecipients(room) {
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.getRecipients", room)
}

function startListening(roomFrom, roomTo) {
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.startListening", roomFrom, roomTo);
}

function stopListening(roomFrom, roomTo) {
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.stopListening", roomFrom, roomTo);
}

function updateRoom(){
	// yet to decide what values can be updated
}

function handleIncomingMessage() {}

function broadcastMessages() {}






*/
// utility functions

function isEmpty(param) {
	if(param === undefined || param === "")
		return true;
	return false;
}
