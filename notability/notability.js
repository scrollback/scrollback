/*

*/

module.exports = function(core, config) {
	var actions = ["text", "away", "back", "join", "part", "expel", "admit"];

	core.on("text", function(action, next) {
		action.concerns = {};
		action.occupants.forEach(function(user) {
			action.concerns[user.id] = 1;
		});
		
		action.mentions.forEach(function(user) {
			if(!action.concerns[user]) action.concerns[user] = 7;
		});
		
		action.members.forEach(function(user) {
			if(!action.concerns[user.id]) action.concerns[user.id] = ;
		});
		
		
		next();
	}, "modifiers");
};
