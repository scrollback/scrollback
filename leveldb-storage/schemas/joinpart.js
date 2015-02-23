var log = require("../../lib/logger.js");
module.exports = function (types) {
    return {
        put: function (data, cb) {
            var linkData = {}.joinMessage = {
                //add only the relavant properties. dont add the user or room object here...
            }
            types.joinpart.put(data, function () {
                if (data.type == "join") {
                    linkData.roleSince = new Date().getTime();


                    //for now getting all the basic join to follower. special roles wil come later.	
                    linkData.role = data.role;

                    /*if(data.role == "follow_requested" || data.requestedRole) {
						linkData.transitionType = "request";
						linkData.transitionRole =  data.requestedRole || "follower";
						linkData.transitionBy = "";
						linkData.transitionMessage = data.text || "";
					}else {
						linkData.role = "follower";
					}*/
                } else if (data.type == "part") {
                    linkData.role = "none";
                    /*types.rooms.unlink(data.room.id, 'hasMember', data.user.id, function(err, data) {
					});*/
                }
                types.rooms.link(data.room.id, 'hasMember', data.user.id, linkData);
                cb();
            });
        }
    }
};