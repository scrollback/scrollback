"use strict";
/*
	Scrollback: Beautiful text chat for your community.
	Copyright (c) 2014 Askabt Pte. Ltd.

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or any
later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see http://www.gnu.org/licenses/agpl.txt
or write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330,
Boston, MA 02111-1307 USA.
*/

function init(core, config) {
	var express = require("./express.js")(core, config),
		socket = require("./socket.js")(core, config),
		plugins = require("./plugins.js")(core, config),
		page = require("./page.js")(core, config),
		app = express.init();

	socket.initServer(app.httpServer);

	if (app.httpsServer) {
		socket.initServer(app.httpsServer);
	}

	plugins.init(app);
	page.init(app);
}

module.exports = function(core, config) {
	init(core, config);

	core.on("room", function(action, next) {
		if (action.room.params.http && typeof action.room.params.http.seo !== "boolean") {
			return next(new Error("ERR_INVAILD_PARAMS"));
		}

		next();
	}, "appLevelValidation");

	core.on("user", function(action, next) {
		if (!action.user.params.notifications) return next();

		if ([ "undefined", "boolean" ].indexOf(typeof action.user.params.notifications.sound) === -1) {
			return next(new Error("ERR_INVAILD_PARAMS"));
		}

		if ([ "undefined", "boolean" ].indexOf(typeof action.user.params.notifications.desktop) === -1) {
			return next(new Error("ERR_INVAILD_PARAMS"));
		}

		next();
	}, "appLevelValidation");
};
