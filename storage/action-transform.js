var log = require('../lib/logger.js');
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
	
	log.d("Text:", text);
	// insert text
	if (text.text) {
		put = makePut("insert", "texts");
		put.insert = {
			id: text.id, 
			from: text.from,
			to: text.to,
			time: new Date(text.time),
			text: text.text,
			thread: text.thread,
			title: text.title,
			tags: text.tags || [],
			mentions: text.mentions,
			upvoters: [],
			flaggers: [],
			updatetime: new Date(text.time),
			updater: text.from
		};
		puts.push(put);
	}

	// insert thread
	if (text.thread) {
		put = makePut("upsert", 'threads');
		put.lock = text.thread;
		put.filters.push(['id', 'eq', text.thread]);

		put.insert = {
			id: text.thread,
			from: text.from,
			to: text.to,
			title: text.title || text.text,
			color: text.color,
			starttime: new Date(text.time),
			length: 1,
			tags: text.tags || [],
			concerns: [],
			updatetime: new Date(text.time),
			updater: text.from
			/* concerns: [text.from].concat(text.mentions) */
		};
		/* For existing threads update endTime, length and perhaps title */
		put.update = [
			['updatetime', 'set', new Date(text.time)],
			['updater', 'set', text.from],
			['length', 'incr', 1]
		];
		if (text.title) put.update.push(['title', 'set', text.title]);
		puts.push(put);
	}
	return puts;
};


exports.edit = function (edit) {
	var puts = [], put;
	
	if (edit.text || edit.tags) {
		put = makePut("update", 'texts');
		put.filters.push(['id', 'eq', edit.ref]);
		if (edit.text) put.update.push(['text', 'set', edit.text]);
		if (edit.tags) put.update.push(['tags', 'set', edit.tags]);
		put.update.push(['updatetime', 'set', new Date(edit.time)]);
		puts.push(put);
	}

	if (edit.title || edit.tags) {
		put = makePut('update', 'threads');
		put.filters.push(['id', 'eq', edit.ref]);
		if(edit.title) put.update.push(['title', 'set', edit.title]);
		if(edit.tags) put.update.push(['tags', 'set', edit.tags]);
		put.update.push(['updatetime', 'set', new Date(edit.time)]);
		puts.push(put);
	}

	puts.push(put);
	return puts;
};


/* TODO 1. if delete time is set then update the type also.
2. check if identities array is a set.*/
exports.room = exports.user = function (action) {

	var entity = action[action.type],
		put = makePut('upsert', 'entities'),
		putOwner = makePut('insert', 'relations');
	put.lock = entity.id;
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
		guides: entity.guides
	};
	put.filters.push(['id', 'eq', entity.id]);
	['description', 'picture', 'timezone', 'params', 'guides'].forEach(function(p) {
			// column name in database are lower case of property name of entity.
			put.update.push([p.toLowerCase(), 'set', entity[p]]);
	});

	if (entity.identities) {
		put.update.push(['identities', 'set', entity.identities.map(function(ident) {
			return [ident.split(':', 2)[0], ident];
		})]);
	}
	if (entity.createTime) {
		put.update.push(['createtime', 'set', new Date(entity.createTime)]);
		put.insert.createtime = new Date(entity.createTime);
	}
	if (entity.deleteTime) {
		put.update.push(['deletetime', 'set', new Date(entity.deleteTime)]);
		put.insert.deletetime = new Date(entity.deleteTime);
	}
	var ret = [put];
	if ((!(action.old && action.old.id)) && (action.type === 'room')) { // add relationship role = owner
		putOwner.insert = {
			room: action.room.id,
			user: action.user.id,
			role: "owner",
			roletime: new Date(action.time)
		};
		ret.push(putOwner);
	}
	return ret;
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
		roletime: new Date(action.time)

	};

	var columnNames = ['role', 'roletime', 'officer', 'message', 'transitionrole', 'transitiontype'];
	var values = [action.role, new Date(action.time), officer, action.text, action.transitionRole, action.transitionType];

	for (var i = 0; i < columnNames.length; i++) {
		put.update.push([columnNames[i], 'set', values[i]]);
	}

	put.filters.push(['user', 'eq', user]);
	put.filters.push(['room', 'eq', action.room.id]);
	put.lock = user + ":" + action.room.id;
	return [put];
	//set
};
