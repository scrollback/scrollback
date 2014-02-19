var config = require("../../config.js");

module.exports = function(store) {
	return store.defineType('edit',{
		indexes: {
			idref: function(text, emit){
				emit(text.id, text.ref);
			}
		}
	});
};
