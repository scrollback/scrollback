var config = require("../../config.js");

module.exports = function(store) {
	return store.defineType('texts',{
		indexes: {
			totime: function (text, emit) {
				/*	time is stored in negative order because most searches
					will be in descending time. LevelDB reversed queries are
					slow.
				*/
				(text.to instanceof Array? text.to: [text.to]).
				forEach(function(to) {emit(to, text.time);});
			},
			tothreadtime: function(text, emit) {
				if(text.labels) for(var i in text.labels) {
					(text.to instanceof Array? text.to: [text.to]).
					forEach(function(to) { emit(to, i, text.time); });
				}
			}
		}
	});
};
