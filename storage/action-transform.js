var storageUtils = require('./storage-utils.js'),
	log = require('../lib/logger.js');
function makePut(type, source) {
	if (!type || !source) {
		return log.d("No source or type");
	}
	var r = { source: source, filters: [], type: type };
	if (type === 'update' || type === 'upsert') r.update = [];
	return r;
}

/*
	BEGIN TRANSACTION;
	DELETE FROM $source WHERE wherify($key);
	INSERT INTO $source 

*/


exports.text = function (text) {
	var puts = [], put;
	
	/* Start Compatibility Block */
	
	addThread(text);
	addTags(text);
	
	/* End Compatibility Block */
	log.d("Text:", text);
	// insert text
	if (text.text) {
		put = makePut("insert", "texts");
		put.insert = {
			id: text.id, from: text.from, to: text.to,
			text: text.text, time: storageUtils.timetoString(text.time), 
			thread: text.thread,
			title: text.title,
			tags: text.tags, mentions: text.mentions
		};
		puts.push(put);
	}
	
	// insert thread
	if (text.thread) {
		put = makePut("upsert", 'threads');
		put.filters.push(['id', 'eq', text.thread]);
		
		put.insert = {
			id: text.thread, from: text.from, to: text.to,
			title: text.title, starttime: storageUtils.timetoString(text.time), 
			endtime: storageUtils.timetoString(text.time), length: 1, tags: text.tags,
			/*mentions: text.mentions*/
		};
		/* For existing threads update endTime, length and perhaps title */
		put.update = [
			['endtime', 'set', storageUtils.timetoString(text.time)],
			['length', 'incr', 1]
		];
		if(text.title) put.update.push(['title', 'set', text.title]);
		puts.push(put);
	}
	return puts;
};


exports.edit = function (edit) {
	var puts = [], put = makePut("update", 'texts');
	put.filters.push(['id', 'eq', edit.ref]);
	put.update = [];
	// start compability block.
	addTags(edit);
	addThread(edit);
	// end Compatibility block.
	if (edit.text) {
		put.update.push(['text', 'set', edit.text]);
	}
	
	if (edit.title) {
		var tput = makePut('update', 'threads');
		tput.filters.push(['id', 'eq', edit.ref]);
		tput.update.push(['title', 'set', edit.title]);
		puts.push(tput);
	}
	
	if (edit.tags) {
		put.update.push(['tags', 'set', edit.tags]); 
	}
	
	puts.push(put);
	return puts;
};


/* TODO 1. if delete time is set then update the type also.
2. check if identities array is a set.*/
exports.room = exports.user = function (action) {
	
	var entity = action[action.type],
		put = makePut('upsert', 'entities');
	
	put.insert = {
		id: entity.id, 
		type: action.type,
		description: entity.description,
		picture: entity.picture,
		
		identities: entity.identities.map(function(ident) {
			return [ident.split(':', 2)[0], ident];
		}),
		timezone: entity.timezone, 
		//locale: entity.locale,
		params: entity.params,
		guides: entity.guides,
		//deletetime: entity.deleteTime
	};
	put.insert.createtime = entity.createTime ? new Date(entity.createTime) : undefined;
	put.insert.deletetime = entity.deleteTime ? new Date(entity.deleteTime) : undefined;
	log.d("Update entity:", action);
	put.filters.push(['id', 'eq', entity.id]);
	['description', 'picture', 'identities', 'timezone', 'params', 'guides'].forEach(function(p) {
			// column name in database are lower case of property name of entity.
			put.update.push([p.toLowerCase(), 'set', entity[p]]);
	});
	if (entity.createTime) put.update.push(['createtime', 'set', new Date(entity.createTime)]);
	if (entity.deleteTime) put.update.push(['deletetime', 'set', new Date(entity.deleteTime)]);

	return [put];
};

exports.join = exports.part = exports.admit = exports.expel = function (action) {
	var put = makePut('upsert', 'relations');
	var user;
	var officer;
	if (action.type === 'admit' || action.type === 'expel') {
		officer = action.user.id;
		user = action.victim.id;
	} else {
		user = action.user.id;
	}
	put.insert = {
		room: action.room.id,
		user: user,
		role: action.role,
		transitionrole: action.transitionRole,
		transitiontype: action.transitionType,
		message: action.text,
		officer: officer,
		roletime: storageUtils.timetoString(action.time)
		
	};
	
	var columnNames = ['role', 'roletime', 'officer', 'message', 'transitionrole', 'transitiontype'];
	var values = [action.role, storageUtils.timetoString(action.time), officer, action.text, action.transitionRole, action.transitionType];
	
	for (var i = 0; i < columnNames.length; i++) {
		put.update.push([columnNames[i], 'set', values[i]]);
	}
	
	put.filters.push(['user', 'eq', user]);
	put.filters.push(['room', 'eq', action.room.id]);
	return [put];
	//set 
};



function addTags(action) {
	if (!action.tags) action.tags = [];
	for (var i in action.labels) if (action.labels[i] > 0.5) action.tags.push(i);
}

function addThread(action) {
	if (action.threads && action.threads[0]) {
		action.thread = action.threads[0].id.substr(0, action.threads[0].id.length-1);
		action.title = action.threads[0].title;
		action.labels['color' + action.threads[0].id.substr(action.threads[0].id.length-1)] = 1;
	}
}
