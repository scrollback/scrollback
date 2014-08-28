/*
	For members, a list of members have to maintained for each room since member roles can vary room to room.

	For occupants, a common occupant list can be maintained with each room having a list of pointers to users in this list.
		By doing this the duplication of occupant objects can be eliminated.
*/

/* global localStorage, libsb */

var roomOccupantList = {};
var globalOccupantList = {};

var roomMemberList = {};
var _this;

var membersPopulated = false;
var occupantsPopulated = false;

module.exports = {
	populateMembers: function (room) {
		// populate memebers of room into our structures.
		var members;
		_this = this;
		libsb.emit("getUsers", {
			memberOf: room,
			noCache: true
		}, function (err, data) {
			members = data.results;
			_this.putMembers(room, members, true);
			_this.deletePersistence();
			_this.saveUsers();
			membersPopulated = true;
		});
	},
	populateOccupants: function (room) {
		var occupants;
		libsb.emit("getUsers", {
			occupantOf: room,
			noCache: true
		}, function (err, data) {
			occupants = data.results;
			_this.putOccupants(room, occupants, true);
			_this.deletePersistence();
			_this.saveUsers();
			occupantsPopulated = true;
		});
	},
	getMembers: function (room, memberId, callback) {
		var res = [];
		this.loadUsers();
		
		if (typeof room ===  "undefined") return;
		
		if (memberId !== null) {
			if (/^guest-/.test(memberId)) {
				res = []; // guest cannot be a member
			}
			// return the single member as an Array
			if (!roomMemberList.hasOwnProperty(room)) {
				res = [];
			}
			else if (!roomMemberList[room].hasOwnProperty(memberId)) {
				res = [];
			}
			else res = [roomMemberList[room][memberId]];
		} else {
			// return all members of the room
			var mList = roomMemberList[room];
			for (var m in mList) {
				res.push(roomMemberList[room][m]);
			}
		}
		if (membersPopulated === true) {
			callback(res);
		} else {
			callback(null);
		}
	},
	getOccupants: function (room, occupantId, callback) {
		var res = [];
		this.loadUsers();
		
		if (occupantId !== null) {
			// return the singe occupant of this room 

			if (!roomOccupantList[room].hasOwnProperty(occupantId)) {
				// the room does not have this occupant
				res = [];
			} else {
				// return occupant object 
				res = [globalOccupantList[occupantId.id]];
			}
		} else {
			// return all occupants of this room as Array.
			for (var r in roomOccupantList[room]) {
				res.push(globalOccupantList[r]);
			}
		}
		
		if (occupantsPopulated === true) {
			callback(res);
		} else {
			callback(null);
		}
	},
	putMembers: function (room, memberList, override) {
		if (typeof room !== "string") {
			return;
		}
		if (override === true) {
			delete roomMemberList[room];
		}
		if (!(memberList instanceof Array)) {
			memberList = [memberList];
		}

		memberList.forEach(function (member) {
			if (!roomMemberList.hasOwnProperty(room)) {
				roomMemberList[room] = {};
				roomMemberList[room][member.id] = member;
			} else {
				roomMemberList[room][member.id] = member;
			}
		});
		this.saveUsers();
	},
	putOccupants: function (room, occupantList, override) {
		if (typeof room !== "string") {
			return;
		}
		if (override === true) {
			// clear old data
			delete roomOccupantList[room];
		}
		if (!(occupantList instanceof Array)) {
			if(typeof occupantList !== "undefined") occupantList = [occupantList];
			else occupantList = [];
		}

		// add each user to globalOccupantList if he is not there already
		// then make entry inside roomOccupantList
		occupantList.forEach(function (occupant) {
			if (!globalOccupantList.hasOwnProperty(occupant)) {
				globalOccupantList[occupant.id] = occupant;
			}
			if (!roomOccupantList.hasOwnProperty(room)) {
				roomOccupantList[room] = {};
			}
			roomOccupantList[room][occupant.id] = true;
		});
		this.saveUsers();
	},
	removeMembers: function (room, memberList) {
		if (!(memberList instanceof Array)) {
			memberList = [memberList];
		}
		memberList.forEach(function (m) {
			delete roomMemberList[room][m];
		});
		this.saveUsers();
	},
	removeOccupants: function (room, occupantList) {
		if (!(occupantList instanceof Array)) {
			occupantList = [occupantList];
		}
		occupantList.forEach(function (o) {
			delete roomOccupantList[room][o];
		});
		this.saveUsers();
	},
	loadUsers: function () {
		if (localStorage.hasOwnProperty("roomOccupantList")) {
			roomOccupantList = JSON.parse(localStorage.roomOccupantList);
		}
		if (localStorage.hasOwnProperty("roomMemberList")) {
			roomMemberList = JSON.parse(localStorage.roomMemberList);
		}
		if (localStorage.hasOwnProperty("globalOccupantList")) {
			globalOccupantList = JSON.parse(localStorage.globalOccupantList);
		}
	},
	saveUsers: function () {
		localStorage.roomOccupantList = JSON.stringify(roomOccupantList);
		localStorage.roomMemberList = JSON.stringify(roomMemberList);
		localStorage.globalOccupantList = JSON.stringify(globalOccupantList);
	},
	deletePersistence: function () {
		// delete LS entry for users.
		delete localStorage.roomOccupantList;
		delete localStorage.roomMemberList;
		delete localStorage.globalOccupantList;
	}
};