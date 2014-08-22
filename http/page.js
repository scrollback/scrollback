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

var config = require('../config.js'), core,
	fs = require("fs"),core;
var clientSubstrings = [];
var seo;
//var log = require('../lib/logger.js');
exports.init = function(app, coreObject) {
	core = coreObject;
    if (!config.http.https) console.warn("Insecure connection. Specify https options in your config file.");
    init();
	app.get('/t/*', function(req, res, next) {
		fs.readFile(__dirname + "/../public/s/preview.html", "utf8", function(err, data){
			res.end(data);
			next();
		});
	});
    
	app.get("/*", function(req, res, next){
		if(/^\/t\//.test(req.path)) return next();
		if(/^\/s\//.test(req.path)) {console.log("static"); return next();}

		if(!req.secure && config.http.https) {
			var queryString  = req._parsedUrl.search ? req._parsedUrl.search : "";
			return res.redirect(307, 'https://' + config.http.host + req.path + queryString);
		}
		
        seo.getSEOHtml(req, function(r) {
            var d = [];
            d.push(clientSubstrings[0]) ;
            d.push(r.head);
            d.push(clientSubstrings[1]);
            d.push(r.body);
            d.push(clientSubstrings[2]);
            res.end(d.join("\n"));
        });

		
	});
};

function init() {
    var clientHTML = fs.readFileSync(__dirname + "/../public/client.html", "utf8");
    seo = require('./seo.js')(core); 
    var idhs = "<!-- gen Head Start -->";
    var idbs = "<!-- Messages start here. -->";
    var index1 = clientHTML.indexOf(idhs);
    var index2 = clientHTML.indexOf(idbs);
    clientSubstrings.push(clientHTML.substring(0, index1 + idhs.length));
    clientSubstrings.push(clientHTML.substring(index1 + idhs.length, index2 + idbs.length));
    clientSubstrings.push(clientHTML.substring(index2 + idbs.length));
}
