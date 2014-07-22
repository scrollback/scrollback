
/**
 * Properties of naviagtion state object
 *
 * room: {String} roomId
 * embed: {Object} { form: (toast|full), nick: {String} }
 * minimize: {Boolean} (true|false)
 * theme: {String} (dark|light)
 * view: {String} (normal|rooms|meta|signup)
 * mode: {String} (normal|search|conf|pref|home|profile)
 * tab: {String} (info|people|threads|local|global)
 * thread: {String} threadId
 * query: {String} searchQuery
 * text: {String} textId
 * time: {String} - Timestamp of chat message
 * old: {Object} - Old state object
 * changes: {Object} - New values of changed properties
 */

module.exports = function(libsb) {
    require("./state-manager/boot-manager.js")(libsb);
    require("./state-manager/state-manager.js")(libsb);
    require("./state-manager/history-manager.js")(libsb);
    require("./state-manager/view-manager.js")(libsb);
};