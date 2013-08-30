"use strict";
var streams = {},
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
});

core.on('disconnected', function() {
	getByClass(document, 'scrollback-text').forEach(function(input) {
		input.disabled = true; input.value = 'Disconnected';
	});
});


core.on("abuse_report",function(messageId){
	
});
// ---- Initialize ----

function init() {
	addStyles(css);
	addStyles(
		scrollback.theme && themes[scrollback.theme]?
		themes[scrollback.theme]: themes.light
	);
	addEvent(window, 'resize', Stream.position);
}

core.on('enter', function(id) {
	var stream = Stream.get(id);
	if (!stream.initialized) {
		if(scrollback.minimized === false) stream.show();
		else stream.hide();
	}
});

core.on('leave', function(id) {
	// close window? do nothing?
});

core.on('nick', function(n) {
	var i, stream;
	var nick=(n.indexOf("guest-")===0)?(n.replace("guest-","")):n;
	
	for(i in streams) if(streams.hasOwnProperty(i)) {

		stream = streams[i];
		stream.nick.innerHTML= nick;
		
		if (n.indexOf("guest-")!==0) {
			removeClass(stream.nick, 'scrollback-nick-guest');
			addClass(stream.nick, 'scrollback-nick');
		}
	}
});

core.on('message', function(m) {
	if (m.to && streams[m.to]) {
		streams[m.to].notify(m);
	}
});

// ---- The Stream constructor ----

function Stream(id) {
	var self = this;
	self.id = id;
	self.stream = JsonML.parse(dom.stream, function(el) {
		switch(true) {
			case hasClass(el, 'scrollback-log'):
				self.log = el;
				addEvent(el, 'scroll', function() { self.scroll(); });
				break;
			case hasClass(el, 'scrollback-nick-guest'):
				self.nick = el;
				if (core.nick().indexOf("guest-") !== 0) {
					removeClass(el, 'scrollback-nick-guest');
					addClass(el, 'scrollback-nick');
				}
				
				addEvent(el, 'click', function() {
					if (core.nick().indexOf("guest-") === 0) {
						self.login();
					}
					else {
						self.profile();	
					}
				});
				
				el.innerHTML= core.nick();
				break;
			case hasClass(el, 'scrollback-text'):
				self.text = el;
				addEvent(el, 'focus', function() { this.select(); });
				addEvent(el, 'keydown', function(e) {
					if(e.keyCode == 13) {
						self.send();
						return false;
					}
					return true;
				});
				break;
			case hasClass(el, 'scrollback-send'):
				self.sendfrm = el;
				addEvent(el, 'submit', function(event) {
					if(event.preventDefault) event.preventDefault();
					self.send();
					return false;
				});
				break;
			case hasClass(el, 'scrollback-tread'):
				self.tread = el;
				break;
			case hasClass(el, 'scrollback-thumb'):
				self.thumb = el;
				break;
			case hasClass(el, 'scrollback-title'):
				self.title = el;
				addEvent(el, 'click', function() { self.toggle(); });
				break;
			case hasClass(el, 'scrollback-title-id'):
				el.innerHTML = id;
				break;
			case hasClass(el, 'scrollback-title-text'):
				self.titleText = el;
				break;
			case hasClass(el, 'scrollback-title-close'):
				addEvent(el, 'click', function() { self.close(); });
				break;
			case hasClass(el, 'scrollback-icon-pop'):
				addEvent(el, 'click', function() { self.pop(); });
				break;
			case hasClass(el, 'scrollback-icon-login'):
				addEvent(el, 'click', function(e) {
					self.login();
					if(e.preventDefault) e.preventDefault();
					if(e.stopPropagation) e.stopPropagation();
					return false;
				});
				break;

		}
		return el;
	});
	
	self.requested = {};
	addEvent(self.stream, 'click', function() { self.select(); });
	document.body.appendChild(self.stream);
}

Stream.prototype.close = function (){
	delete streams[this.id];
	core.leave(this.id);
	document.body.removeChild(this.stream);
	Stream.position();
};

Stream.prototype.pop = function () {
	window.open(scrollback.host + '/' + this.id + '/', "_blank");
};

Stream.prototype.toggle = function() {
	if(this.hidden) this.show();
	else this.hide();
	Stream.position();
};

Stream.prototype.hide = function() {
	removeClass(this.stream, 'scrollback-stream-selected');
	addClass(this.stream, 'scrollback-stream-hidden');
	this.hidden = true;
};

Stream.prototype.login = function () {
	dialog.show("/dlg/login#" + core.nick(), function(data) {
		console.log("Got assertion", data);
		if(!data) return;
		if(data.assertion) core.nick({ browserid: data.assertion });
		else if(data.guestname) core.nick('guest-' + data.guestname);
	});
};

Stream.prototype.show = function() {
	var self = this;
	removeClass(this.stream, 'scrollback-stream-hidden');
	setTimeout(function() {
		if (!self.initialized) {
			self.bottom = true;
			core.watch(self.id, null, 32, 0, function(m) { self.update(m); });
			self.initialized = true;
		}
	}, 250 );
	this.hidden = false;
};

Stream.prototype.send = function () {
	var text = this.text.value, parts;
	if(!text) return;
	this.text.value = '';
	
	if (text[0] == '/') {
		parts = text.substr(1).split(' ');
		switch (parts[0]) {
			case 'nick':
				this.nick.innerHTML= parts[1];
				this.rename();
				return;
			case 'leave':
				if(scrollback.close) this.close();
				return;
		}
	}
	this.log.scrollTop = this.log.scrollHeight;
	core.say(this.id, text);
};

Stream.prototype.notify = function(message) {
	var el = this.renderMessage(message);
	this.titleText.innerHTML = (el.innerText || el.textContent);
	
	//if (!this.hidden && this.bottom && message.type !== 'text') {
	//	this.log.appendChild(el);
	//	this.log.scrollTop = this.log.scrollHeight;
	//	setTimeout(function() { addClass(el, 'scrollback-message-hidden'); }, 1000);
	//}
};

Stream.prototype.rename = function() {
	var n = this.nick.innerText || this.nick.textContent;
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

// ---- Static methods ----------------------------------

Stream.get = function(id) {
	if(!id) throw "Can't get a stream with no ID!";
	if(streams[id]) {
		return streams[id];
	} else {
		streams[id] = new Stream(id);
		Stream.position();
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
		scrh = window.innerHeight || document.documentElement.clientHeight ||
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
			y += h;
			removeClass(col, 'scrollback-stream-right');
		} else {
			h = hasClass(col, 'scrollback-stream-hidden')? minHeight: colh;
			col.style.height = Math.round(h) + 'px';
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

