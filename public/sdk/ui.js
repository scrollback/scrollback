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
			stream = Stream.get(scrollback.streams[i]);
			stream.hide();
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
			onclick: function() { self.show(); }
		},
			["span", {
				'class': 'scrollback-icon scrollback-menu'
			}, '☰'],
			id,
			["span", {
				'class': 'scrollback-title-text',
				onclick: function() { self.show(); }
			}],
			["div", {
				'class': 'scrollback-icon scrollback-close',
				onclick: function() { self.close(); }
			}, '×'],
			["div", {
				'class': 'scrollback-icon scrollback-hide',
				onclick: function(event) {
					self.hide();
					if(event.stopPropagation) event.stopPropagation();
					else event.cancelBubble = true;
				}
			}, '_']
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
		if(el.className == 'scrollback-log') self.log = el;
		else if(el.className == 'scrollback-nick') self.nick = el;
		else if(el.className.indexOf('scrollback-hide') != -1) self.hidebtn = el;
		else if(el.className == 'scrollback-text') self.text = el;
		else if(el.className == 'scrollback-send') self.sendfrm = el;
		else if(el.className == 'scrollback-tread') self.tread = el;
		else if(el.className == 'scrollback-thumb') self.thumb = el;
		else if(el.className == 'scrollback-title') self.title = el;
		else if(el.className == 'scrollback-title-text') self.titleText = el;
		return el;
	});
	
	self.connected = false;
	document.body.appendChild(self.stream);
};

Stream.prototype.close = function (){
	delete streams[this.id];
	socket.emit('message', {type: 'part', to: this.id});
	document.body.removeChild(this.stream);
	Stream.position();
};

Stream.prototype.hide = function() {
	removeClass(this.stream, 'scrollback-stream-selected');
	addClass(this.stream, 'scrollback-stream-hidden');
	this.hidebtn.innerHTML = '‾';
};

Stream.prototype.show = function() {
	var self = this;
	removeClass(this.stream, 'scrollback-stream-hidden');
	this.titleText.innerHTML='';
	this.hidebtn.innerHTML = '_';
	setTimeout(function() { self.renderTimeline(); }, 250 );
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
	Stream.message(message);
	unconfirmed.push(message);
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
		// do something more interesting next time.
		return text;
	}

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
			message.text = format(message.text);
			name=message.text.match(
				/^(\@?)([a-zA-Z_\\\[\]\{\}\^\`\|][a-zA-Z0-9_\-\\\[\]\{\}\^\`\|]+)( |\:|\,)/
			);
			
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
			[ "span", { 'class': 'scrollback-timestamp-hidden'}, new Date(message.time).toString()]];
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

	str.pendingScroll = (str.pendingScroll || 0) + el.clientHeight;

	if(str.scrollTimer) clearTimeout(str.scrollTimer);
	str.scrollTimer = setTimeout(function() {
		var i, l, hidden = $$(str.log, "scrollback-message-hidden");
		for(i=0, l=hidden.length; i<l; i++) {
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
//		console.log(n);
	}
	nick = n;
};

Stream.position = function() {
	var ss = $$(document, "scrollback-stream"), i, l=ss.length,
		step = 1, z=0,
		scrw = window.innerWidth || document.documentElement.clientWidth ||
			document.getElementsByTagName('body')[0].clientWidth,
		scrh = window.innerHeight || document.documentElement.clientHeight ||
			document.getElementsByTagName('body')[0].clientHeight,		
		colw = Math.min(scrw, maxWidth),
		pitch = Math.min((scrw - colw - 2*margin)/l, 420), col;
	
	for(i=0; i<l; i++) {
		col = ss[i];
		col.style.right = (margin + i*pitch) + 'px';
		col.style.width = colw + 'px';
		col.style.zIndex = z + l;
		if(col.className.indexOf('scrollback-stream-selected') != -1) step = -1;
		if(step < 0 || pitch >= 400) {
			removeClass(col, 'scrollback-stream-right');
		} else {
			addClass(col, 'scrollback-stream-right');
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