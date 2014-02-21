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
				type:"text",
				from:old.from,
				to:old.to,
				labels:{},
				session: old.session || ""
			};
			if(old.labels){
				if(old.labels instanceof Array) {
					old.labels.forEach(function(label) {
						newText.labels[label] = 1;
					});
				}else{
					for(i in old.labels) {
						if(old.labels.hasOwnProperty(i)) newText.labels[i] = old.labels[i];
					}
				}
			}
			
			if(old.editInverse) newText.editInverse = old.editInverse;
			editAction ={
				id:data.id,
				from:data.from,
				ref: data.ref,
				to: old.to,
				session: data.session
			};

			if(data.labels) {
				 editAction.labels = {};
				for(i in data.labels) {
					if(data.labels.hasOwnProperty(i)) {
						if(!editInvs.labels) editInvs.labels = {};
						if(newText.labels.hasOwnProperty(i)) {
							if(newText.labels[i]!== data.labels[i]) editInvs.labels[i]=newText.labels[i];
						}else{
							editInvs.labels[i]=null;
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
			}else{
				newText.text = old.text;
			}
			if(!newText.editInverse) newText.editInverse = [];
			newText.editInverse.push(editInvs);
			textsApi.put(newText);
			edit.put(editAction);
			cb(null, editAction);
		}
	};
};
