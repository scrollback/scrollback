/* global module, require, exports */
var log = require("../../lib/logger.js");

module.exports = function (types) {

	var edit = types.edit;
	var texts = types.texts;
	var textsApi = require("./text.js")(types);
	
	return {
		put: function (data, cb) {
			var old = data.old;
			var editAction, editInvs = {}, newText;
			newText = {
				id:old.id,
				time: old.time,
				from:old.from,
				to:old.to,
				user:old.user,
				room:old.user,
				labels:{}
			};
			for(i in old.labels) if(old.labels.hasOwnProperty(i)) newText.labels[i] = old.labels[i];
			editAction ={
				id:data.id,
				from:data.from,
				ref: data.ref,
			};
			if(data.labels) {
				 editAction.labels = {};
				for(i in data.labels) {
					if(data.labels.hasOwnProperty(i)) {
						if(old.labels[i]) {
							if(!editInvs.labels) editInvs.labels = {};
							editInvs.labels[i]=old.labels[i];
						}
						newText.labels[i] = data.labels[i];
						editAction.labels[i] = data.labels[i];
					}
				}
			}

			if(data.text) {
				editInvs.text = old.text;
				editAction.text = data.text;
				newText.text = data.text;
			}
			if(!newText.editInverse) newText.editInverse = [];
			newText.editInverse.push(editInvs);
			// console.log("Edit",editAction);
			// console.log("invs",editInvs);
			// console.log("new",newText);
			textsApi.put(newText);
			edit.put(editAction);
		}
	};
};
