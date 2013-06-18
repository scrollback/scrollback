"use strict";

var streams = {}, nick = null,
	$ = function(id) {
		return document.getElementById(id);
	}, $$ = getByClass;

var unconfirmed = [];

window.requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		function(cb) { setTimeout(cb, 25); };

// ---- Initialize ----

DomReady.ready(function() {
	var i, stream;
	
	addStyles(css);
	addStyles(
		scrollback.theme && themes[scrollback.theme]?
		themes[scrollback.theme]: theme.light
	);
	addEvent(window, 'resize', Stream.position);
	
	if(scrollback.streams && scrollback.streams.length) {
		for(i=0; i<scrollback.streams.length; i+=1) {
			if(!scrollback.streams[i]) break;
			stream = Stream.get(scrollback.streams[i]);
			if(scrollback.minimize !== false) stream.toggle();
		}
	}
});

// ---- The Stream constructor ----

function Stream(id) {
	var self = this;
	self.id = id;
	self.stream = JsonML.parse(["div", {
		'class': 'scrollback-stream',
		onmousedown: function() { self.select(); }
	},
		["div", {
			'class': 'scrollback-title',
			onclick: function() { self.toggle(); }
		},
			["span", {
				'class': 'scrollback-icon scrollback-menu'
			}, '☰'],
			scrollback.close? ["div", {
				'class': 'scrollback-icon scrollback-close',
				onclick: function() { self.close(); }
			}, '×']: "",
			["div", {
				'class': 'scrollback-icon scrollback-embed',
				onclick: function() { self.embed(); }
			}, '➚'],
			["div", {'class': 'scrollback-title-content'}, id,
				["span", {
					'class': 'scrollback-title-text'
			}]],
		],
		["div", {'class': 'scrollback-timeline'},
			["div", {'class': 'scrollback-tread'}],
			["div", {'class': 'scrollback-thumb'}]
		],
		["div", {'class': 'scrollback-log', onscroll: function() { self.scroll(); }}],
		["form", {
			'class': 'scrollback-send',
			onsubmit: function(event) {
				if(event.preventDefault) event.preventDefault();
				self.send();
				return false;
			}
		},
			["input", {
				'class': 'scrollback-nick',
				onchange: function() { self.rename(); },
				onfocus: function() { this.select(); },
				value: nick, disabled: true
			}],
			["div", {'class': 'scrollback-text-wrap'}, ["input", {
				'class': 'scrollback-text',
				value: 'Connecting...', disabled: true
			}]],
			["button", {type: 'submit', 'class': 'scrollback-hidden'}, "Send"]
		],
		["a", {href: "http://scrollback.io", "class": "scrollback-poweredby", target: "_blank"}]
	], function(el) {
		if(hasClass(el, 'scrollback-log')) self.log = el;
		else if(hasClass(el, 'scrollback-nick')) self.nick = el;
		else if(hasClass(el, 'scrollback-text')) self.text = el;
		else if(hasClass(el, 'scrollback-send')) self.sendfrm = el;
		else if(hasClass(el, 'scrollback-tread')) self.tread = el;
		else if(hasClass(el, 'scrollback-thumb')) self.thumb = el;
		else if(hasClass(el, 'scrollback-title')) self.title = el;
		else if(hasClass(el, 'scrollback-title-text')) self.titleText = el;
		else if(hasClass(el, 'scrollback-embed')) self.embedBtn = el;
		return el;
	});
	
	self.joined = false;
	document.body.appendChild(self.stream);
};

Stream.prototype.close = function (){
	delete streams[this.id];
	socket.emit('message', {type: 'part', to: this.id});
	document.body.removeChild(this.stream);
	Stream.position();
};

Stream.prototype.embed = function () {
	var popupWindow=window.open(scrollback.host + '/' + this.id,"_blank");

	

	//showPopup(this.embedBtn, JsonML.parse(
	//	["div", {style: {width: "200px", height: "100px"}},
	//		"http://" + scrollback.host + '/' + this.id
	//	]));
};

Stream.prototype.toggle = function() {
	var self = this;
	if(hasClass(this.stream, 'scrollback-stream-hidden')) {
		removeClass(this.stream, 'scrollback-stream-hidden');
		this.titleText.innerHTML='';
		setTimeout(function() { self.renderTimeline(); }, 250 );
		
		if(!this.joined) {
			socket.emit('message', {
				type: 'join',
				to: self.id
			});
		}
		
	} else {
		removeClass(this.stream, 'scrollback-stream-selected');
		addClass(this.stream, 'scrollback-stream-hidden');
	}
	Stream.position();
};

Stream.prototype.send = function (){
	if(!this.text.value) return;
	var message = {
		from: nick,
		to: this.id,
		text: this.text.value,
		type: 'text',
		time: new Date().getTime() + timeAdjustment
	};
	socket.emit('message', message);
	this.text.value = '';
//	Stream.message(message);
//	unconfirmed.push(message);
};

Stream.prototype.rename = function() {
	var n = this.nick.value;
	socket.emit('nick', n);
//	Stream.updateNicks(n);
};

Stream.prototype.select = function() {
	var ss = $$(document, "scrollback-stream"), i, l = ss.length;
	for(i=0; i<l; i+=1) {
		removeClass(ss[i], 'scrollback-stream-selected');
	}
	addClass(this.stream, 'scrollback-stream-selected');
	Stream.position();
};

Stream.prototype.ready = function() {
	this.nick.disabled = false;
	this.text.disabled = false;
	this.joined = true;
	this.text.value = '';
};

// ---- Static methods ----

Stream.message = function(message) {
	var el, str, bot = null, pos = null;
	var estimatedTime = Math.min(3000 * (message.text||'').length / 5, 5000),
		name, color='#666', start = new Date();
	
	if(isEcho(message)) return;

	//console.log(message.type+" : "+ message.text);
	function format(text) {
		var u = /\b(https?\:\/\/)?([a-z0-9\-]+\.)+[a-z]{2,4}\b((\/|\?)\S*)?/g,
			m = ["span"], r, s=0;
		while((r = u.exec(text)) !== null) {
			// console.log(text, r.index, u.lastIndex);
			m.push(text.substring(s, r.index));
			s = u.lastIndex;
			m.push(["a", {href: r[1]?r[0]:'http://'+r[0]}, r[0]]);
		}
		m.push(text.substring(s));
		// do something more interesting next time.
		// console.log(m);
		return m;
	}
	
	if(!message.to) return;
	str = Stream.get(message.to);
	
	if(message.type === 'text') {
		if(typeof str.firstMessageAt === 'undefined' ||
			message.time < str.firstMessageAt
		) str.firstMessageAt = message.time;
		
		if(typeof str.lastMessageAt === 'undefined' ||
			message.time > str.lastMessageAt) str.lastMessageAt = message.time;
	}
	
	if(hasClass(str.stream, 'scrollback-stream-hidden') &&
		scrollback.ticker && message.type === 'text'
	) {
		str.titleText.innerHTML = ' ▸ ' + message.from + ' • ' + message.text;
	}

	function formatName(name) {
		// TODO
		return name;
	}
	
	switch(message.type) {
		case 'text':
			name=message.text.match(
				/^(\@?)([a-zA-Z_\\\[\]\{\}\^\`\|][a-zA-Z0-9_\-\\\[\]\{\}\^\`\|]+)( |\:|\,)/
			);
			message.text = format(message.text);
			
			if(name && (name[2].length !== 0) && (name[1] == '@' || name[3] != ' ')) {
				color=hashColor(name[2]);
			}
			
			el = [[ "span", {
				'class': 'scrollback-message-nick',
				onmouseout: function() {
					if(str.userStyle) str.userStyle.parentNode.removeChild(str.userStyle);
					},
				onmouseover: function() {
				var ucss = {".scrollback-tread-row": {width: "0 !important"}};
					ucss[ ".scrollback-user-" + formatName(message.from)] = {
						"background": hashColor(message.from) + " !important",
						width: "100% !important"
					};
					str.userStyle = addStyles(ucss);
				}
			}, message.from ],
			[ "span", {
				'class': 'scrollback-message-separator', 'style': 'color:'+color
			}, ' • '],
			[ "span", { 'class': 'scrollback-message-text'}, message.text ],
			[ "span", { 'class': 'scrollback-message-timestamp'},
				"Sent " + prettyDate(
					message.time, new Date().getTime() + timeAdjustment)
			]];
			break;
		case 'join':
			el = [["span", message.from + ' joined.']];
			// intentional fall through.
		case 'part':
			el = el || [["span", message.from + ' left' + (
				message.text? ' (' + message.text + ')': '.'
			)]];
			setTimeout(function(){
				el.className += ' scrollback-message-hidden';
			}, 1000);
			break;
		default:
			el = [["span", message.text]];
	}
	
	if(!el) return;

	el = JsonML.parse(["div", {
		'class': 'scrollback-message scrollback-message-' + message.type,
		'style': { 'borderLeftColor': hashColor(message.from) },
		'data-time': message.time, 'data-from': formatName(message.from)
	}].concat(el));
	if(str.lastInsertPos && str.lastInsertPos.getAttribute('data-time') > message.time) {
		//console.log("Starting at last insert pos");
		bot = str.lastInsertPos;
	} else {
		//console.log("Starting at end.");
		bot = str.log.lastChild;
	}

	while(
		bot && bot.getAttribute('data-time') > message.time /*- estimatedTime */
	){
		pos = bot;
		bot = bot.previousSibling;
	}
	str.lastInsertPos = pos;
	str.log.insertBefore(el, pos);
	
	if(el.previousSibling) {
		if(message.time - el.previousSibling.getAttribute('data-time') < 60000)
			addClass(el.previousSibling, 'scrollback-timestamp-hidden');
		else
			removeClass(el.previousSibling, 'scrollback-timestamp-hidden');
	}
	
	if(el.nextSibling) {
		if(el.nextSibling.getAttribute('data-time') - message.time < 60000)
			addClass(el, 'scrollback-timestamp-hidden');
		else
			removeClass(el, 'scrollback-timestamp-hidden');
	}

	str.pendingScroll = (str.pendingScroll || 0) + el.clientHeight;

	if(str.scrollTimer) clearTimeout(str.scrollTimer);
	str.scrollTimer = setTimeout(function() {
		var i, l, hidden = $$(str.log, "scrollback-message-hidden");
		for(i=0, l=hidden.length; i<l; i+=1) {
			str.log.removeChild(hidden[i]);
		}
		
		str.log.scrollTop += str.pendingScroll;
		str.pendingScroll = 0;
		
		if(str.stream.className.indexOf('scrollback-stream-hidden') == -1)
			str.renderTimeline();
	}, 100);
	
	//console.log("Message insertion took " + (new Date() - start) + 'ms');
};

Stream.get = function(id) {
	var holder;
	if(!id) throw "Can't get a stream with no ID!";
	id = id.toLowerCase();
	if(streams[id]) {
		return streams[id];
	} else {
		streams[id] = new Stream(id);
		Stream.position();
		streams[id].lastRequestedUntil = new Date().getTime() + timeAdjustment;
		socket.emit('get', { to: id, until: new Date().getTime() + timeAdjustment, type: 'text' });
		return streams[id];
	}
};

Stream.updateNicks = function(n) {
	var i, stream;
	for(i in streams) {
		stream = streams[i];
		stream.nick.value = n;
	}
	nick = n;
};

Stream.position = function() {
	var maxWidth = scrollback.maxWidth || 400,
		maxHeight= scrollback.maxHeight|| 400,
		minWidth = scrollback.minWidth || 250,
		minHeight= scrollback.minHeight|| 48,
		maxGap   = scrollback.maxGap   || 20,
		minPitch = scrollback.minPitch || 120,
		margin   = scrollback.margin   || 40;
	var ss = $$(document, "scrollback-stream"), i, l=ss.length,
		step = 1, z=0, colw, colh, col, y=0, h, stacked, pitch,
		scrw = document.documentElement.clientWidth ||
			document.getElementsByTagName('body')[0].clientWidth,
		scrh = document.documentElement.clientHeight ||
			document.getElementsByTagName('body')[0].clientHeight;
			
	if(scrw < minWidth + 2*margin + minPitch*(l-1)) {
		stacked = true;
		pitch = 0; colw=scrw; margin=0;
		colh = Math.min(maxHeight, scrh - minHeight*(l-1));
	} else if(scrw < maxWidth + 2*margin + minPitch*(l-1)) {
		stacked = false;
		pitch = minPitch;
		colw = scrw - 2*margin - (l-1)*minPitch;
		colh = Math.min(maxHeight, scrh);
	} else {
		stacked = false;
		colw = maxWidth;
		pitch = Math.min((scrw - colw - 2*margin)/(l-1), maxWidth + maxGap);
		colh = Math.min(maxHeight, scrh);
	}
	
	for(i=0; i<l; i+=1) {
		col = ss[i];
		col.style.right = (margin + i*pitch) + 'px';
		col.style.width = colw + 'px';
		
		if(hasClass(col, 'scrollback-stream-selected')) {
			step = -1;
		}
		if(stacked) {
			h = hasClass(col, 'scrollback-stream-selected')? colh: minHeight;
			col.style.height = h + 'px';
			col.style.bottom = y + 'px';
			col.style.zIndex = z + l;
			y += h;
		} else {
			h = hasClass(col, 'scrollback-stream-hidden')? minHeight: colh;
			col.style.height = h + 'px';
			col.style.bottom = '0px';
			col.style.zIndex = z + l;
			if(step < 0 || pitch >= colw || i===(l-1)) {
				removeClass(col, 'scrollback-stream-right');
			} else {
				addClass(col, 'scrollback-stream-right');
			}
		}
		
		
		z = z + step;
	}
};

// --- color for names ---

function hashColor(name) {
	name = name.toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/^\s+/g,'').replace(/\s+$/g,''); 
	 // nicks that differ only by case or punctuation should get the same color.
	
	function hash(s) {
		var h=1, i, l;
		s = s.toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/^\s+/g,'').replace(/\s+$/g,''); 
		// nicks that differ only by case or punctuation should get the same color.
		for (i=0, l=s.length; i<l; i++) {
			h = (Math.abs(h<<(7+i))+s.charCodeAt(i))%1530;
		}
		return h;
	}
	
	function color(h) {
		// h must be between [0, 1529] inclusive
		
		function hex(n) {
			var h = n.toString(16);
			h = h.length==1? "0"+h: h;
			return h;
		}
		
		function rgb(r, g, b) {
			return "#" + hex(r) + hex(g) + hex(b);
		}
		
		if(h<255) return rgb(255, h, 0);
		else if(h<510) return rgb(255-(h-255), 255, 0);
		else if(h<765) return rgb(0, 255, h-510);
		else if(h<1020) return rgb(0, 255-(h-765), 255);
		else if(h<1275) return rgb(h-1020, 0, 255);
		else return rgb(255, 0, 255-(h-1275));
	}
	
	return color(hash(name));
}

function isEcho (next) {
	var i, prev, t = new Date().getTime() + timeAdjustment;
	
	for(i=unconfirmed.length-1; i>=0; i--) {
		prev = unconfirmed[i];
		if(prev.time < t-15000) {
			console.log("Removing " + (i+1) + " messages older than 1 minute.");
			unconfirmed = unconfirmed.splice(0, i+1);
			break;
		}
		if(
			prev.type == next.type &&
			prev.text == next.text &&
			prev.from == next.from &&
			prev.to == next.to
		) {
			console.log(next.type + ': ' + next.from + '->' + next.to + " is an echo");
			unconfirmed = unconfirmed.splice(i,1);
			return true;
		}
	}
	return false;
}

function showPopup(btn, el) {
	var scrw = window.innerWidth,
		scrh = window.innerHeight,
		popw, poph, pop, btno, btnx, btny, btnh, btnw;
	
	btno = offset(btn);
	btnx = btno.left, btny = btno.top;
	btnh = btn.offsetHeight; btnw = btn.offsetWidth;
	
	
	pop = $$(document, 'scrolback-popup')[0];
	if(pop) pop.parentNode.removeChild(pop);
	
	pop = JsonML.parse(["div", { 'class': 'scrollback-popup' }]);
	pop.appendChild(el);
	document.body.appendChild(pop);
	
	popw = pop.offsetWidth; poph = pop.offsetHeight;
	
	console.log(btno, btnh, btnw, scrw, scrh, popw, poph);
};