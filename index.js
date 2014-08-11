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

require('newrelic');

var core = new (require("./lib/emitter.js"))(), config = require("./config.js");

process.nextTick(function(){
	// The ident server binds to port 113 after a while.
	// if(config.core.uid) process.setuid(config.core.uid);
});
process.title = config.core.name;

function start(name) {
	var plugin = require("./"+name+"/"+name+".js");
	plugin(core);
}

config.plugins.forEach(function(name) {
	start(name);
});
