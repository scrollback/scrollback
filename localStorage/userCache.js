/*
	For members, a list of members have to maintained for each room since member roles can vary room to room.
	
	For occupants, a common occupant list can be maintained with each room having a list of pointers to users in this list. 
		By doing this the duplication of occupant objects can be eliminated.
*/
var occupants = {}; 
var roomOccupantList = {};

var members = {};

module.exports = {
	getMembers: function (room, member) {

	},
	getOccupants: function (room, occupant) {

	},
	putMembers: function (room, memberList) {

	},
	putOccupants: function (room, occupantList) {
		
	}
};