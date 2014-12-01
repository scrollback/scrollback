var config = require("../../server-config-defaults.js");

module.exports = function (store) {
    return store.defineType('edit', {
        indexes: {
            ref: function (text, emit) {
                emit(text.ref);
            }
        }
    });
};