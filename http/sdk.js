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

var config = require('./config.js');
var fs = require("fs");
var wh = require("./warehouse.js");

var res = require("./lib/respond.js"),
	log = require("./lib/logger.js").tag('AA/AP'),
	success = res.success, failure = res.failure;




function getContext(req) {
	return {
		webhost: config.webhost,
		user: req.session.user,
		account: req.session.account,
		participations: []
	};
}

var code = fs.readFileSync(__dirname + "/www/js/client.js");

exports.init = function(app) {
	app.get('/context.js', function(req, res, next) {
		var str = "var context = " + JSON.stringify(getContext(req)) + ";";
		res.writeHead(200, {
			"Content-Type": "application/javascript",
			"Content-Length": str.length
		});
		res.end(str);
//		if(next) next();
	});
	
	
	app.get('/1.js', function(req, res, next) {
		if(!wh.validateKey(req)) {
			failure(req, res)('Invalid API key or not a legitimate request');
			return;
		}
		
		var str="(function(){var askabt_key='"+req.query.key+"',"+
			"context=" + JSON.stringify(getContext(req)) + ";"+
			code+"})();";
		res.writeHead(200, {
			"Content-Type": "application/javascript; charset=utf-8",
			"Content-Length": Buffer.byteLength(str, "utf8")
		});
		
		console.log(str.length);
		res.write(str);
		
		res.end("");
	});
};

