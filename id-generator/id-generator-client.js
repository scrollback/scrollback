/* global libsb*/
var generate = require('../lib/generate.js');

function generateID(action, next){
    if(!action.id) action.id = generate.uid();
    next();
} 
var events = ['join-up','part-up','away-up','back-up','text-up','init-up','admit-up','expel-up','user-up','room-up'];

module.exports = function() {
	events.forEach(function(e) { libsb.on(e, generateID, "validation"); });
};