var underscore = require('underscore');
var libsb = {
	on: core.on,
	emit: core.emit,
	
	user: "",
	rooms: "",
	occupantOf: [],
	memberOf: [],
	isConnected: false,
	
	connect: connect,
	disconnect: disconnect,
	getTexts: getTexts,
	watch: watch,
	unwatch: unwatch,
	
	getLabels: getLabels,
	getOccupants: getOccupants,
	getMembers: getMembers,
	getRooms: getRooms,
	enter: enter,
	leave: leave,
	join: join,
	part: part,
	sendText: sendText,
	
	roomConfigForm: roomConfigForm,
	userPreferForm: userPreferForm
	
};

var core;

module.exports = function(c){
	core = c;
	window.libsb = libsb;

    core.on('init-dn', recvInit);
	core.on('back-dn', recvBack);
	core.on('away-dn', recvAway);
	core.on('join-dn', recvJoin);
	core.on('part-dn', recvPart);
	core.on('text-dn', recvText);
}

function connect(){
	core.emit('connection-requested');
}

function getTexts(query, callback){
	core.emit('getTexts', query, callback);
}

function getOccupants(query, callback){
	core.emit('getUsers', query, callback);
}

function getMembers(query, callback){
	core.emit('getUsers', query, callback);
}

function getRooms(query, callback){
	core.emit('getRooms', query, callback);
}

function getLabels(query, callback){
	core.emit('getLabels', query, callback);	
}

function enter(roomId, callback){
	core.emit('back-up', roomId, callback);
}

function leave(roomId, callback){
	core.emit('away-up', roomId, callback);
}

function join(roomId, callback){
	core.emit('join-up', roomId, callback);
}

function part(){
	core.emit('part-up', roomId, callback);
}

function sendText(){
	core.emit('text-up', roomId, callback);
}

function recvInit(init, next){
	if(underscore.isEqual(libsb.user, init.user)){
		libsb.user = init.user;
		core.emit('user-update');
	}
	next();
}

function recvBack(back, next){
	if(back.from !== libsb.user.id) return next();
	if(!libsb.rooms.filter(function(room){ return room.id === back.to }).length) libsb.rooms.push(back.room);
	if(!libsb.occupantOf.filter(function(room){ return room.id === back.to}).length) libsb.occupantOf.push(back.room);
	next();
}

function recvAway(away, next){
	if(away.from !== libsb.user.id) return next();
	
	libsb.rooms = underscore.compact(libsb.rooms.map(function(room){ if(room.id !== away.to) return room; }));
	libsb.occupantOf = underscore.compact(libsb.occupantOf.map(function(room){ if(room.id !== away.to) return room; }));
	next();
}

function recvJoin(join, next){
	if(join.from !== libsb.user.id) return next();
	if(!libsb.memberOf.filter(function(room){return room.id === join.to }).length) libsb.memberOf.push(join.room);
	next();
}

function recvPart(part, next){
	if(part.from !== libsb.user.id) return next();
	libsb.memberOf = underscore.compact(libsb.memberOf.map(function(room){if(room.id !== part.to) return room; }));
	next();
}

function recvText(text, next){
	
}