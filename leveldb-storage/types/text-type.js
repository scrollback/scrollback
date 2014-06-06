var config = require("../../config.js");

module.exports = function(store) {
	return store.defineType('texts',{
		indexes: {
			totime: function (text, emit) {
				emit(text.to, text.time);
			},
			tothreadtime: function(text, emit) {
				if(text.threads) {
					text.threads.forEach(function(i) {
						emit(text.to, i.id, text.time)
					});
				}
			}
		}
	});
};
