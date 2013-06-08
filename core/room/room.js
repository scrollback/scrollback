// imports
var core=require(process.cwd()+"/core/core.js");
var sync = require('sync');

var getRoom=function(room){
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.get", room);	
}.async();


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

var deleteRoom=function(room) {
	if(isEmpty(room.id))
		throw new Error("specify the room id");
	var newRoom={
		id:room.id,
		deletedOn:new Date()
	};
	return core.db.execute("room.delete", newRoom);
}.async();

var getListeners=function (room) {
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("room.getListeners", {id:room.id});
}.async();



var getListening=function (room) {

	if(isvalidRoom()){
		throw new Error("Your room not found.");
	}
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	if(getRoom(room.id).length===0)
		
	return core.db.execute("room.getListening",  {id:room.id});;
}.async();





var startListening=function(roomFrom,roomTo){
	if(isEmpty(roomFrom.id) && isEmpty(roomTo.id))
		throw new Error("the id of a room cannot be empty");
	if(getRoom(roomFrom.id).length===0)
		throw new Error("Your room not found.");
	 if(getRoom(roomTo.id).length===0)
		throw new Error("Room that you indend to follow is not found.");
	return core.db.execute("room.startListening", {fromId:roomFrom.id,toId:roomTo.id});
}.async();


var addAccount=function(room,account){
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	return core.db.execute("account.create", 
		{
			ownerId:room.id,
			id:account.id,
			gateway:account.gateway,
			remoteId:account.remoteId,
			present:account.present,
			params:account.present
		}
	);
}.async();


exports.startListening=startListening;
//exports.getRecipients=getRecipients;
exports.getListening=getListening;
exports.getListeners=getListeners;
exports.deleteRoom=deleteRoom;
exports.getRoom=getRoom;
exports.createRoom=createRoom;
exports.addAccount=addAccount;


/*


var stopListening=function(roomFrom,roomTo){
	if(isEmpty(roomFrom.id) && isEmpty(roomTo.id))
		throw new Error("the id of a room cannot be empty");
	if(getRoom(roomFrom.id).length===0}
		throw new Error("Your room not found.");
	 if(getRoom(roomTo.id).length===0)
		throw new Error("Listening room not found.");
	return core.db.execute("room.startListening", {fromId:roomFrom.id,toId:roomTo.id});
};



var getRecipients=function(room) {
	if(isEmpty(room.id))
		throw new Error("the id of a room cannot be empty");
	if(getRoom(room.id).length===0)
		throw new Error("Your room not found.");
	return core.db.execute("room.getRecipients", room)
}.async();


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