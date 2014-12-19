function makePut() {
	return { source: null, filters: [] };
}

/*
	BEGIN TRANSACTION;
	DELETE FROM $source WHERE wherify($key);
	INSERT INTO $source 

*/


exports.text = function (text) {
	var puts = [], put;
	
	/* Start Compatibility Block */
	text.thread = text.threads[0].id.substr(0,text.threads[0].id.length-1);
	text.title = text.threads[0].title;
	text.labels = text.labels || {};
	text.labels['color' + text.threads[0].id.substr(text.threads[0].id.length-1)] = 1;
	text.tags = [];
	for(var i in text.labels) if(text.labels[i] > 0.5) text.tags.push(i);
	/* End Compatibility Block */
	
	// insert text
	if(text.text) {
		put = makePut();
		put.source = 'texts';
		put.insert = {
			id: text.id, from: text.from, to: text.to,
			text: text.text, time: text.time, thread: text.thread,
			tags: text.tags, mentions: text.mentions
		};
		puts.push(put);
	}
	
	// insert thread
	if(text.thread) {
		put = makePut();
		put.source = 'threads';
		put.filters.push(['id', 'eq', text.thread]);

		if(text.id == text.thread) {
			/* This is a new thread */
			put.insert = {
				id: text.thread, from: text.from, to: text.to,
				title: text.title, startTime: text.time, 
				endTime: text.time, length: 1, tags: text.tags,
				mentions: [text.from].concat(text.mentions.filter(
					// prevent text.from duplication
					function(it) { return it != text.from; }
				))
			};
		} else {
			/* For existing threads update endTime, length and perhaps title */
			put.update = [
				['endTime', 'set', text.time],
				['length', 'incr', 1]
			];
			
			if(text.title) put.update.push(['title', 'set', text.title]);
		}
		puts.push(put);
	}
	return puts;
};


exports.edit = function (edit) {
	var puts = [], put = makePut();
	put.source = 'texts';
	put.filters.push(['id', 'eq', edit.ref]);
	put.update = [];
	
	if(edit.text) {
		put.update.push(['text', 'set', edit.text]);
	}
	
	if(edit.title) {
	}
	
	return puts;
};

exports.room = exports.user = function (action) {
	var entity = action[action.type], put;
	
	put.source = 'entities';
	if(entity.identities.length) {
		entity.identities = entity.identities.map(function(ident) {
			return ident.split(':', 2);
		});
	}
	
	put.insert = {
		id: entity.id, type: action.type, description: entity.description,
		picture: entity.picture, createTime: entity.old.createTime,
		identities: entity.identities.map(function(ident) { 
			return ident.split(':', 2); 
		}),
		timezone: entity.timezone, locale: entity.locale,
		params: entity.params
	};
	
	put.filters.push(['id', 'eq', entity.id]);
	
	if(action.type == 'room') {
		put.insert.guides = entity.guides;
	}
	
	return [put];
};

exports.join = exports.part = exports.admit = exports.expel = function (action) {
	
};