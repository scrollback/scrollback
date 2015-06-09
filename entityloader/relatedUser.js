"use strict";
var core,
	log = require("../lib/logger.js"),
	uid = require('../lib/generate.js').uid;


function checkPresnse(room, user, callback) {
	core.emit("getUsers", {occupantOf: room, ref:user, session: "internal-loader"}, function(occupantErr, response) {
		var result = false;
		if (occupantErr || !response || !response.results || !response.results.length) result = false;
		else if(response.results[0] && response.results[0].id === user) result = true;
		return callback(result);
	});
}


function loadRelation(room, user, callback) {
	core.emit("getUsers", {
		session: "internal-loader",
		ref: user,
		memberOf: room
	}, function(memberErr, relations) {
		if (memberErr || !relations || !relations.results || !relations.results.length) {
			callback(null);
		} else {
			callback(relations.results[0]);
		}
	});
}

function loadRelatedUser(room, user, session, callback) {
	core.emit("getUsers", {
		id: uid(),
		ref: user,
		session: session
	}, function(userErr, data) {
		var userObj;
		if (userErr || !data || !data.results || !data.results.length) {
			return callback(new Error("USER_NOT_FOUND"));
		} else {
			userObj = data.results[0];
			if (!/guest-/.test(userObj.id)) {
				var id = uid();	
				core.emit("getUsers", {
					id: id,
					session: session,
					ref: user,
					memberOf: room
				}, function(memberErr, relations) {
					var resp;
					if (memberErr || !relations || !relations.results || !relations.results.length) {
						resp = userObj;
						userObj.role = "registered";
						callback(null, resp);
					} else {
						callback(null, relations.results[0]);
					}
				});
			} else {
				userObj.role = "guest";
				callback(null, userObj);
			}
		}
	});
}



function exp(c) {
	core = c;
	return loadRelatedUser;
}

module.exports = exp;
