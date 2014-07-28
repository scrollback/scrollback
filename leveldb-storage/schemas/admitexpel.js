module.exports = function (types) {
    return {
        put: function (action, cb) {
            types.admitexpel.put(action, function () {
                var linkData = {};

                if (!action.victim.role || action.victim.role != "none") {
                    linkData.roleSince = action.victim.roleSince || new Date().getTime();
                } else {
                    linkData.roleSince = new Date().getTime();
                }

                linkData.transitionBy = action.user.id;
                linkData.transitionMessage = action.transitionMessage || "";

                if (action.type == "admit") {
                    if (!action.victim.role || action.victim.role != "none") {
                        linkData.role = "none";
                    }
                    linkData.transitionType = "invite";
                    linkData.transitionRole = action.invitedRole;
                } else if (action.type == "expel") {
                    linkData.role = "banned";
                    linkData.transitionType = "timeout";
                    linkData.transitionRole = action.victim.role;
                    linkData.transitionMessage = action.transitionMessage;
                    linkData.roleUntil = action.transitionAt || (new Date().getTime() + 300000);
                }
                types.rooms.link(action.room.id, 'hasMember', action.victim.id, linkData, function () {
                    cb();
                });
            });
        }
    };
};