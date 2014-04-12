/* global window, Bus, generate */

/* jshint unused: false */

window.libsb = (function() {
	var core = new Bus();
	
	function text(time) {
		return {
			from: 'guest-' + generate.word(8),
			to: 'testroom',
			text: generate.paragraph(2),
			time: time
		};
	}
	
	function gotText() {
		core.emit('text-dn', text(new Date().getTime()));
		setTimeout(gotText, 3000 + (Math.random()-0.5)*2*2500);
	}
	
	return {
		user: {id: 'guest-default', picture: 'http://gravatar.com/avatar/hello?s=48'},
		rooms: [],
		occupantOf: [],
		memberOf: [],
		isConnected: false,
		
		connect: function () { core.emit('connected'); },
		disconnect: function () { core.emit('disconnected'); },
		
		emit: core.emit.bind(core),
		on: core.on.bind(core),
		
		getTexts: function (query, cb) {
			var i, l, r=[], now = (new Date()).getTime(), time, MTBT=6000000;
			
			query.before = query.before || 0;
			query.after = query.after || 0;
			query.time = query.time || now;
			query.to = query.to || 'sandbox';
			time = query.time - (query.before * MTBT);
			for(i=0, l=query.before + query.after; i<l; i++) {
				if(time >= now) { r.push(false); break; }
				if(time < now - 100 * MTBT) {
					if(r.length === 0) r.push(false);
					continue;
				}
				r.push(text(time + (Math.random()-0.5)*MTBT*0.9));
				time += MTBT;
			}
			
			setTimeout(function() { cb(null, r); }, 500);
		},
		getLabels: function (query, cb) {},
		getOccupants: function (rid, cb) {},
		getMembers: function (rid, cb) {},
		getRooms: function (query, cb) {},
		
		enter: function (rid, cb) {},
		leave: function (rid, cb) {},
		join: function (rid, cb) {},
		part: function (rid, cb) {},
	};
	
}());