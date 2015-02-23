/* jshint browser:true */
/* global libsb */


/*
	For members, a list of members have to maintained for each room since member roles can vary room to room.

	For occupants, a common occupant list can be maintained with each room having a list of pointers to users in this list.
		By doing this the duplication of occupant objects can be eliminated.
*/

var spaceManager = require('./spaceManager.js');

var roomOccupantList = {};
var globalOccupantList = {};

var roomMemberList = {};
var _this;

var membersPopulated = false;
var occupantsPopulated = false;

if (typeof window === "undefined") {
	// for unit tests.
	membersPopulated = true;
	occupantsPopulated = true;
}

module.exports = {
	rooms: {},
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
	hasKnowledgeOf: function (property, roomName) {
		switch(property){
				case "occupants" :
					if (!roomOccupantList.hasOwnProperty(roomName)) return false;
					break;
				case "members":
					if (!roomMemberList.hasOwnProperty(roomName)) return false;
				break;
		}
		return true;
	},
	getMembers: function (room, memberId, callback) {
		var res = [];
		this.loadUsers();

		if (typeof room === "undefined") return;

		if (memberId !== null) {
			if (/^guest-/.test(memberId)) {
				res = []; // guest cannot be a member
			}
			// return the single member as an Array
			if (!roomMemberList.hasOwnProperty(room)) {
				res = [];
			} else if (!roomMemberList[room].hasOwnProperty(memberId)) {
				res = [];
			} else res = [roomMemberList[room][memberId]];
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
			if (typeof occupantList !== "undefined") occupantList = [occupantList];
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
			delete roomMemberList[room][m.id];
		});
		this.saveUsers();
	},
	removeOccupants: function (room, occupantList) {
		if (!(occupantList instanceof Array)) {
			occupantList = [occupantList];
		}
		occupantList.forEach(function (o) {
			delete roomOccupantList[room][o.id];
		});
		this.saveUsers();
	},
	loadUsers: function () {
		var data;

		data = spaceManager.get('roomOccupantList');
		if (data !== null) roomOccupantList = data;

		data = spaceManager.get('roomMemberList');
		if (data !== null) roomMemberList = data;
		
		data = spaceManager.get('globalOccupantList');
		if (data !== null) globalOccupantList = data;
	},
	saveUsers: function () {
		spaceManager.set('roomOccupantList', roomOccupantList);
		spaceManager.set('roomMemberList', roomMemberList);
		spaceManager.set('globalOccupantList', globalOccupantList);
	},
	saveRooms: function () {
		spaceManager.set('rooms', this.rooms);
	},
	loadRooms: function () {
		var data = spaceManager.get('rooms');
		if (data !== null) {
			this.rooms = data;
		}
	},
	deletePersistence: function () {
		// delete LS entry for users.
		spaceManager.clear('roomOccupantList', 'roomMemberList', 'globalOccupantList');
	},
	delRoomTimeOut: function (roomId) {
		/*
		this function deletes a saved room object from the cache every 'n' mintues
	*/
		var minutes = 10; // 10 minutes timeout

		clearTimeout(window.timeoutMapping[roomId]);

		window.timeoutMapping[roomId] = setTimeout(function () {
			if (this.cache && this.cache.rooms) {
				delete this.cache.rooms[roomId];
				this.save();
			}
		}, minutes * 60 * 1000);
	}
};