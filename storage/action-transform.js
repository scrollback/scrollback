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
			text: text.text,
			time: new Date(text.time),
			updatetime: new Date(text.time),
			thread: text.thread,
			title: text.title,
			tags: text.tags, mentions: text.mentions
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
			title: text.title,
			starttime: new Date(text.time),
			updatetime: new Date(text.time),
			length: 1,
			updater: text.from,
			color: (/[0-9]/.test(text.thread.substr(text.thread.length - 1)) ?
					text.thread.substr(text.thread.length - 1) : 0)
			/*mentions: text.mentions*/
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
	var puts = [], put = makePut("update", 'texts');
	put.filters.push(['id', 'eq', edit.ref]);
	put.update = [];
	// start compability block.
	addOldTags(edit);
	addTags(edit);
	addThread(edit);
	// end Compatibility block.
	if (edit.text || edit.tags) {
		put.update.push(['updatetime', 'set', new Date(edit.time)]);
	}
	if (edit.text) {
		put.update.push(['text', 'set', edit.text]);
	}
	if (edit.tags) {
		put.update.push(['tags', 'set', edit.tags]);
	}

	if (edit.title) {
		var tput = makePut('update', 'threads');
		tput.filters.push(['id', 'eq', edit.ref]);
		tput.update.push(['title', 'set', edit.title]);
		tput.update.push(['updatetime', 'set', new Date(edit.time)]);
		puts.push(tput);
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



function addTags(action) {
	if (!action.tags) {
		action.tags = [];

		for (var i in action.labels) {
			if (action.labels[i] > 0.5) {
				action.tags.push(i);
			}
		}
	}
}

function addThread(action) {
	if (action.threads && action.threads[0]) {
		action.thread = action.threads[0].id; // .substr(0, action.threads[0].id.length - 1);
		action.title = action.threads[0].title;
	}
}

function addOldTags(edit) {

	if (edit.old && edit.old.labels) {
		var newLabels = edit.old.labels;
		for(var l in edit.old.labels) {
			if (edit.old.labels.hasOwnProperty(l)) {
				newLabels[l] = edit.old.labels[l];
			}
		}
		if (edit.labels) {
			for (var label in edit.labels) {
				if (edit.labels.hasOwnProperty(label)) {
					newLabels[label] = edit.labels[label];
				}
			}
		}
		edit.labels = newLabels;
	}
}
