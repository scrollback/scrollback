var sync = require('sync');
var db=require('./database.js');



/* exports */
exports.init=function(){
	exports.room = require(process.cwd()+'/core/room/room.js');
	/*exports.user = require('./user/user.js');
	exports.post = require('./post/post.js');	*/
};

exports.db=db;