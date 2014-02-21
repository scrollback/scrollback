var config = require("../../config.js");

module.exports = function(store) {
	return store.defineType('edit',{
		indexes: {
			ref: function(text, emit){
				emit(text.ref);
			}
		}
	});
};
