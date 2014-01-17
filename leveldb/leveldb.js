var db = require("objectlevel")(),
	config = require("../config.js");

objectlevel.connect(config.leveldb.path);
var types = require("./types.js")(objectlevel);

var texts = require("./schemas/text.js")(types);

module.exports = function(core) {
	core.on('message', texts.put, 'storage');
//	core.on('messages', texts.get, 'storage');
	core.on('join', 
};
