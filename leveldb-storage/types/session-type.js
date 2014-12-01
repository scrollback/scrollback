var config = require("../../server-config-defaults.js");

module.exports = function (store) {
    return store.defineType('session', {
        indexes: {
            usergateway: function (session, emit) {
                emit(session.user, session.gateway);
            }
        }
    });
};