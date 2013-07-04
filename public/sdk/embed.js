"use strict";

var streams = {}, nick = null,
	$ = function(id) {
		return document.getElementById(id);
	}, $$ = getByClass;

var unconfirmed = [], initialized = false;

// Display connection and disconnection messages.
core.on('connected', function() {
	if(!initialized) {
		init();
		initialized = true;
	}
	getByClass(document, 'scrollback-text').forEach(function(input) {
		input.disabled = false; input.value = '';
	});
	getByClass(document, 'scrollback-nick').forEach(function(input) {
		input.disabled = false; 
	});
});

core.on('disconnected', function() {
	getByClass(document, 'scrollback-text').forEach(function(input) {
		input.disabled = true; input.value = 'Disconnected';
	});
	getByClass(document, 'scrollback-nick').forEach(function(input) {
		input.disabled = true; 
	});
});

// ---- Initialize ----

function init() {
	var i;
	
	addStyles(css);
	addStyles(
		scrollback.theme && themes[scrollback.theme]?
		themes[scrollback.theme]: themes.light
	);
	addEvent(window, 'resize', Stream.position);
}

core.on('enter', function(id) {
	var stream = Stream.get(id);
	if(scrollback.minimized === false) stream.toggle();
});

core.on('leave', function(id) {
	// close window? do nothing?
});

core.on('nick', function(n) {
	var i, stream;
	for(i in streams) if(streams.hasOwnProperty(i)) {
		stream = streams[i];
		stream.nick.value = n;
	}
	nick = n;
});

// ---- The Stream constructor ----

function Stream(id) {
	var self = this;
	self.id = id;
	self.stream = JsonML.parse(dom.stream, function(el) {
		if(hasClass(el, 'scrollback-log')) {
			self.log = el;
			addEvent(el, 'scroll', function() { self.scroll(); });
		}
		else if(hasClass(el, 'scrollback-nick')) {
			self.nick = el;
			addEvent(el, 'change', function() { self.rename(); });
			addEvent(el, 'focus', function() { this.select(); });
			el.value = nick
		}
		else if(hasClass(el, 'scrollback-text')) self.text = el;
		else if(hasClass(el, 'scrollback-send')) {
			self.sendfrm = el;
			addEvent(el, 'submit', function(event) {
				if(event.preventDefault) event.preventDefault();
				self.send();
				return false;
			});
		}
		else if(hasClass(el, 'scrollback-tread')) self.tread = el;
		else if(hasClass(el, 'scrollback-thumb')) self.thumb = el;
		else if(hasClass(el, 'scrollback-title')) {
			self.title = el;
			addEvent(el, 'click', function() { self.toggle(); });
		}
		else if(hasClass(el, 'scrollback-title-id')) el.innerHTML = id;
		else if(hasClass(el, 'scrollback-title-text')) self.titleText = el;
		else if (hasClass(el, 'scrollback-title-close')) {
			addEvent(el, 'click', function() { self.close(); });
		}
		else if(hasClass(el, 'scrollback-embed')) {
			addEvent(el, 'click', function() { self.embed(); });
		}
		return el;
	});
	
	addEvent(self.stream, 'click', function() { self.select(); });
	self.joined = false;
	document.body.appendChild(self.stream);
}

Stream.prototype.close = function (){
	delete streams[this.id];
	core.leave(this.id);
	document.body.removeChild(this.stream);
	Stream.position();
};

Stream.prototype.embed = function () {
	window.open(scrollback.host + '/' + this.id + '/', "_blank");
};

Stream.prototype.toggle = function() {
	var self = this;
	if(hasClass(this.stream, 'scrollback-stream-hidden')) {
		removeClass(this.stream, 'scrollback-stream-hidden');
		this.titleText.innerHTML='';
		setTimeout(function() { self.renderTimeline(); }, 250 );
		self.join();
	} else {
		removeClass(this.stream, 'scrollback-stream-selected');
		addClass(this.stream, 'scrollback-stream-hidden');
	}
	Stream.position();
};

Stream.prototype.send = function () {
	if(!this.text.value) return;
	core.say(this.id, this.text.value);
	this.text.value = '';
};

Stream.prototype.rename = function() {
	var n = this.nick.value;
	core.nick(n);
};

Stream.prototype.select = function() {
	var ss = $$(document, "scrollback-stream"), i, l = ss.length;
	for(i=0; i<l; i+=1) {
		removeClass(ss[i], 'scrollback-stream-selected');
	}
	addClass(this.stream, 'scrollback-stream-selected');
	Stream.position();
};

// ---- Static methods ----

Stream.get = function(id) {
	if(!id) throw "Can't get a stream with no ID!";
	if(streams[id]) {
		return streams[id];
	} else {
		streams[id] = new Stream(id);
		Stream.position();
		core.watch(id, null, 32, 0, function(m) { streams[id].update(m); });
		return streams[id];
	}
};

Stream.stack=function(){
	var ss = $$(document, "scrollback-stream"), i, l=ss.length, col,
		z=0, step=1;
	for(i=0; i<l; i+=1) {
		col=ss[i];
		if(hasClass(col, 'scrollback-stream-selected')) {
			step = -1;
		}
		col.style.zIndex=l+z;
		z += step;
	}
};

Stream.position = function() {
	var maxWidth = scrollback.maxWidth || 400,
		maxHeight= scrollback.maxHeight|| 400,
		minWidth = scrollback.minWidth || 250,
		minHeight= scrollback.minHeight|| 44,
		maxGap   = scrollback.maxGap   || 20,
		minPitch = scrollback.minPitch || 120,
		margin   = scrollback.margin   || 40;
		
	var ss = $$(document, "scrollback-stream"), i, l=ss.length,
		step = 1, colw, colh, col, y=0, h, stacked=false, pitch,
		scrw = document.documentElement.clientWidth ||
			document.getElementsByTagName('body')[0].clientWidth,
		scrh = window.innerHeight;
		
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
			y += h;
			removeClass(col, 'scrollback-stream-right');
		} else {
			h = hasClass(col, 'scrollback-stream-hidden')? minHeight: colh;
			col.style.height = h + 'px';
			col.style.bottom = '0px';
			if(step < 0 || pitch >= colw || i===(l-1)) {
				removeClass(col, 'scrollback-stream-right');
			} else {
				addClass(col, 'scrollback-stream-right');
			}
		}
	}
	Stream.stack();
};

// ------- Incomplete: Show a popup for previews -----

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

