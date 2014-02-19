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

var express = require("./express.js"),
	socket = require("./socket.js"),
	log = require("../lib/logger.js"),
	plugins = require('./plugins.js'),
	page=require("./page.js");
	app = express.init();

var init = function(core) {
	socket.init(app.httpServer, core);
	if(app.httpsServer) socket.init(app.httpsServer, core);
	plugins.init(app, core);
	page.init(app, core);
	
};

module.exports = function(core){
	init(core);
	core.on("message" , function(message, callback) {
		log("Heard \"message\" Event");
		if(typeof message.to == "string")
			send(message, [message.to]);
		else if(typeof message.to == "object")
			send(message, message.to);
		callback();
	}, "gateway");
	core.on("edit", function(edit, callback) {
		emit("edit", edit, edit.to);
		callback();
	},"gateway");
	var send = socket.send;
	var emit = socket.emit;
};
