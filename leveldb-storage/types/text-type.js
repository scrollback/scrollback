module.exports = function(store) {
	store('texts', {
		indexes: {
			totime: function (text, emit) {
				/*	time is stored in negative order because most searches
					will be in descending time. LevelDB reversed queries are
					slow.
				*/
				emit(text.to, -text.time);
			},
			tolabeltime: function(text, emit) {
				if(text.labels) for(var i in text.labels) {
					emit(text.to, i, -text.time);
				}
			},
			mentiontotime: function(text, emit) {
				if(text.mentions) 
					text.mentions.forEach(function(m) { emit(m, text.to, -text.time); });
			}
		}
	});
};
