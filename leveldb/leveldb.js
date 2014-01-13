var objectlevel = require("objectlevel"),
	config = require("../config.js");

objectlevel.connect(config.leveldb.path);

var texts = require("./schemas/text.js")(objectlevel);

module.exports = function(core) {
	core.on('message', texts.put, 'storage');
//	core.on('messages', texts.get, 'storage');
	
};
