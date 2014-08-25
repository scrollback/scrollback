var fs = require('fs');
var changes = {};

if (fs.existsSync('./myConfig.js')) {
	changes = require("./myConfig.js");
}
/**
 *It merge c into d
 *@param {object} d default Object
 *@param {object} c this object will be merged into d.
 */
function merge(d, c) {
	for(var i in c) {
		if (typeof d[i] === 'object' && typeof c[i] === 'object' && d[i] !== null && c[i] !== null) {
			if (d[i] instanceof Array && c[i] instanceof Array) {
				d[i] = c[i];
			} else {
				merge(d[i], c[i]);
			}
		} else {
			d[i] = c[i];
		}
	}
}


var defaults = {
	botNick: "scrollback",//default bot nick,
	port: 8910,
	debug: false
};
merge(defaults, changes);
module.exports = defaults;
