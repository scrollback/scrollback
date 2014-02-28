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
	roomConfigForm: roomConfigForm,
	userPreferForm: userPreferForm
};

var core;

module.exports = function(c){
	core = c;
	window.libsb = libsb;

    core.on('init-dn', function(){
			
    });
}