var config = require("../../config.js");

module.exports = function(store) {
	return store.defineType('awayback',{
		indexes: {
			totimefrom: function (text, emit) {
				/*	time is stored in negative order because most searches
					will be in descending time. LevelDB reversed queries are
					slow.
				*/
				(text.to instanceof Array? text.to: [text.to]).
				forEach(function(to) {emit(to, -text.time, text.from);});
			}
		}
	});
};
