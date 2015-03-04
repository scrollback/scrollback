var core, config, store;
var relationsProps = require("./../property-lists.js").relations;
module.exports = function(c, conf, s) {
	core = c;
	config = conf;
	store = s;
	
	core.on("setstate", function(changes, next) {
		var listeningRooms;
		if(changes.app && changes.app.connectionStatus && changes.app.connectionStatus === "offline"){
			changes.app.listeningTo = null;
		}
		if(changes.nav && changes.nav.room) {
			listeningRooms = store.getApp("listeningRooms");		
			if(listeningRooms.indexOf(changes.nav.room) <0) {
				sendBack();
			}
		}
		next();
	}, 900);
};


function sendBack(roomId) {
	core.emit("back-dn", {
		to:roomId
	},function(err, back) {
		var changes = {}, relation = {};
		if(err) return;
		
		
		
	});
}