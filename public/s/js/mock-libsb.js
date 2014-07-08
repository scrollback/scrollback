/* global window, Bus, generate */
/* jshint unused: false */

window.libsb = (function() {
	var core = new Bus();

	function text(time, thread) { return {
		from: 'sb-' + generate.word(8),
		to: 'testroom',
		text: generate.paragraph(),
		threads: [{
			id: thread || generate.guid(31) + Math.floor(Math.random() * 10),
			title: generate.sentence(3),
			score: Math.random()
		}],
		time: time
	};}

	function thread(time, id) { return {
		id: id || generate.guid(31) + Math.floor(Math.random() * 10),
		to: generate.word(8),
		title: generate.sentence(3),
		startTime: time,
		endTime: null
	};}

	function person(prefix) { return {
		id: (prefix || "") + generate.word(8),
		picture: 'http://gravatar.com/avatar/' + generate.hex(16) + '?d=retro&s=%s'
	};}

	function room(id) { return {
		id: id || generate.word(),
		description: generate.paragraph()
	};}

	function gotText() {
		core.emit('text-dn', text(new Date().getTime()));
		setTimeout(gotText, 3000 + (Math.random()-0.5)*2*2500);
	}

	core.on('text-up', function (text, next) {
		text.from = 'you';
		text.time = new Date().getTime();
		next();
		core.emit('text-dn', text);
	});

	gotText();

	return {
		user: person(),
		rooms: [],
		occupantOf: [],
		memberOf: [],
		isConnected: false,

		connect: function () { core.emit('connected'); },
		disconnect: function () { core.emit('disconnected'); },

		emit: core.emit.bind(core),
		on: core.on.bind(core),

		getTexts: function (query, cb) {
			var i, l, r=[], now = (new Date()).getTime(), time, MTBT=600000;

			query.before = query.before || 0;
			query.after = query.after || 0;
			query.time = query.time || now;
			query.to = query.to || 'sandbox';
			time = query.time - (query.before * MTBT);
			for(i=0, l=query.before + query.after; i<l; i++) {
				if(time >= now) break;
				if(time >= now - 100 * MTBT) {
					r.push(text(time + (Math.random()-0.5)*MTBT*0.9, query.thread));
				}
				time += MTBT;
			}

			setTimeout(function() { cb(null, r); }, 500);
		},
		getThreads: function (query, cb) {
			var i, l, r=[], now = (new Date()).getTime(), time, MTBT=6000000;
			if(typeof query === 'string') return cb(null, thread(now, query));

			query.before = query.before || 0;
			query.after = query.after || 0;
			query.time = query.time || now;
			query.to = query.to || 'sandbox';
			time = query.time - (query.before * MTBT);
			for(i=0, l=query.before + query.after; i<l; i++) {
				if(time >= now) break;
				if(time >= now - 100 * MTBT) {
					r.push(thread(time + (Math.random()-0.5)*MTBT*0.9));
				}
				time += MTBT;
			}

			setTimeout(function() { cb(null, r); }, 500);
		},
		getOccupants: function (rid, cb) {
			var i, r=[];
			for(i=0; i<200; i++) r.push(person(Math.random()<3? '': 'guest-'));
			setTimeout(function() { cb(null, r); }, 500);
		},
		getMembers: function (rid, cb) {
			var i, r=[];
			for(i=0; i<200; i++) r.push(person(''));
			setTimeout(function() { cb(null, r); }, 500);
		},
		getRooms: function (query, cb) {
			var i, r = [];
			if(typeof query === 'string') r = room(query);
			else for(i=0; i<20; i++) r.push(room());
			setTimeout(function() { cb(null, r); }, 500);
		},
		enter: function (rid, cb) {},
		leave: function (rid, cb) {},
		join: function (rid, cb) {},
		part: function (rid, cb) {},
	};
}());
