/* eslint-env es6 */

"use strict";

const UserInfo = require("./user-info.js"),
	  permissionWeights = require("../authorizer/permissionWeights.js");

class Relation {
	constructor(store, roomId, userId) {
		userId = typeof userId === "string" ? userId : store.get("user");
		roomId = typeof roomId === "string" ? roomId : store.get("nav", "room");

		this._store = store;

		this.user = userId;
		this.room = roomId;
		this.relation = store.getRelation(roomId, userId);
	}

	getRole() {
		var rel = this.relation,
			role;

		if (rel && rel.role && rel.role !== "none") {
			role = rel.role;
		} else {
			role = new UserInfo(this.user).isGuest() ? "guest" : "registered";
		}

		return role;
	}

	isAdmin() {
		return /^(owner|moderator|su)$/.test(this.getRole());
	}

	isReadable() {
		let roomObj = this._store.getRoom(this.room),
			readLevel;

		readLevel = (roomObj && roomObj.guides && roomObj.guides.authorizer &&
					 roomObj.guides.authorizer.readLevel) ? roomObj.guides.authorizer.readLevel : "guest";

		return (permissionWeights[this.getRole()] >= permissionWeights[readLevel]);
	}

	isWritable() {
		var roomObj = this._store.getRoom(this.room),
			writeLevel;

		writeLevel = (roomObj && roomObj.guides && roomObj.guides.authorizer &&
					  roomObj.guides.authorizer.writeLevel) ? roomObj.guides.authorizer.writeLevel : "guest";

		return (permissionWeights[this.getRole()] >= permissionWeights[writeLevel]);
	}
}

module.exports = Relation;
