"use strict";
var streams = {}, $$ = getByClass;

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
	
	scrollback && scrollback.streams && scrollback.streams.forEach(function(room) {
		if(streams[room]) streams[room].notify("And... we're back.");
	});
});


core.on('disconnected', function() {
	getByClass(document, 'scrollback-text').forEach(function(input) {
		input.disabled = true; input.value = 'Disconnected';
	});
	getByClass(document, 'scrollback-nick').forEach(function(input) {
		input.disabled = true; 
	});
	scrollback.streams.forEach(function(room) {
		streams[room].notify("Disconnected. Refresh page to reconnect.", true);
	});
});


// ---- Initialize ----

function init() {
	addStyles(css);
	addStyles(
		scrollback.theme && themes[scrollback.theme]?
		themes[scrollback.theme]: themes.light
	);
	addEvent(window, 'resize', Stream.position);
	scrollback && scrollback.streams && scrollback.streams.forEach(function(id) {
		var stream = Stream.get(id);
		if (!stream.initialized) {
			if(scrollback.minimized === false) stream.show();
			else stream.hide();
		}
	});
}

core.on('enter', function(id) {
	// nothing any more.
});

core.on('leave', function(id) {
	// close window? do nothing?
});

core.on('nick', function(n) {
	var i, stream;
	var nick = n.replace(/^guest-/,'');
	
	for(i in streams) if(streams.hasOwnProperty(i)) {
		stream = streams[i];
		stream.nick.innerHTML = nick; // Fix XSS possibility!
		
		if (n.indexOf("guest-")!==0) {
			removeClass(stream.nick, 'scrollback-nick-guest');
			addClass(stream.nick, 'scrollback-nick');
		}
	}
});

core.on('message', function(m) {
	if (m.to && streams[m.to]) {
		streams[m.to].onmessage(m);
	}
});


/**
 *add part class.
 */
function partMembership(el, self) {
	if (!self.membershipHidden) {
		self.membershipHidden = el;
	}
	if(core.membership.indexOf(self.id)==-1) {
		addClass(el, "scrollback-hidden");
		// come up with a better name..
		self.membershipHidden = el;
	}
	addEvent(el, "click", function(e) {
		if(e.preventDefault) e.preventDefault();
		if(e.stopPropagation) e.stopPropagation();	
		core.join("part",self.id);
	});
	core.on('message',function(m){
		if (m.type === "part" && m.to === self.id && el != self.membershipHidden && core.nick() == m.from) {//hide part show join
			addHiddenClass(el,self);
			core.membership.splice(core.membership.indexOf(self.id),1);
		}	
	});
	core.on('membership', function(membership) {
		if (core.membership.indexOf(self.id)==-1 && el != self.membershipHidden) {//show join hide part
			addHiddenClass(el,self);
		}			
	});
}

/**
 *add join class
 */
function joinMembership(el, self){
	if(core.membership.indexOf(self.id)!=-1) {
		addHiddenClass(el,self);
	}
	addEvent(el,'click',function(e){
		if(e.preventDefault) e.preventDefault();
		if(e.stopPropagation) e.stopPropagation();
		if (core.nick().indexOf('guest-')==0) {
			login();
			return;
		}
		core.join("join",self.id);
	})
	core.on('message',function(m){
		if (m.type == "join" && m.to == self.id && el != self.membershipHidden && core.nick() == m.from) {//show part hide join
			addHiddenClass(el,self);
			core.membership.push(self.id);
		}	
	});
	core.on('membership', function(membership) {
		if (core.membership.indexOf(self.id)!=-1 && el != self.membershipHidden) {//hide join show part
			addHiddenClass(el,self);
		}			
	});
}


function addHiddenClass(el,self){
	addClass(el, "scrollback-hidden");
	removeClass(self.membershipHidden , "scrollback-hidden");
	self.membershipHidden = el;
}
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
			case hasClass(el, 'scrollback-nick-guest') || hasClass(el, 'scrollback-nick'):
				self.nick = el;
				if (core.nick().indexOf("guest-") !== 0) {
					removeClass(el, 'scrollback-nick-guest');
					addClass(el, 'scrollback-nick');
					el.innerHTML = core.nick();
				} else {
					el.innerHTML = core.nick().substr(6);
				}
				
				addEvent(el, 'click', function() {
					if (core.nick().indexOf("guest-") === 0) {
						login();
					}
					else {
						profile();	
					}
				});
				
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
				el.innerHTML = scrollback.title || id;
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
			case hasClass(el, 'scrollback-alert'):
					self.alert=el;
				break;
			case hasClass(el, 'scrollback-icon-login'):
				addEvent(el, 'click', function(e) {
					login();
					if(e.preventDefault) e.preventDefault();
					if(e.stopPropagation) e.stopPropagation();
					return false;
				});
				break;
			case hasClass(el, "scrollback-icon-part"):
				partMembership(el,self);
				break;
			case hasClass(el, "scrollback-icon-join"):
				joinMembership(el,self);
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

function login (options) {
	options = options || {};
	if(options.requireAuth && Stream.text && Stream.prevText){
		Stream.text.value=Stream.prevText; //added prev text value on TextField
		delete Stream.text;
		delete Stream.prevText;
	}
	dialog.show("/dlg/login"+ (options.requireAuth? "?requireAuth=1": "") +"#" + core.nick(), function(data) {
		var nickObj;
		if(!data) return;
		if(data.assertion) nickObj = { browserid: data.assertion };
		else if(data.guestname) nickObj = 'guest-' + data.guestname;
		
		if(nickObj) core.nick(nickObj, function (reply) {
			scrollback.debug && console.log(reply.message);
			if(reply.message) {
				// this is an error;
				if(reply.message == "AUTH_UNREGISTERED")
				{
					scrollback.debug && console.log("calling profile....");
					profile();
				}
				
				dialog.send("error", reply.message);
			} else {
				// this is a message;
				dialog.hide();
			}
		});
	});
}

function profile() {
	dialog.show("/dlg/profile", function(user) {
		var nickObj;
		if(!user) {
			dialog.hide();
			return;
		}
		
		if (user.guestname) {
			core.nick(user.guestname,function(err){
				dialog.hide();	
			});
			return;
		}
		
		core.nick({ user: user }, function(nickResponse){
			if (nickResponse.message) {
				dialog.send("error",nickResponse.message);
			}else{
				dialog.hide();	
			}
		});
	});
}

core.on('error', function(err) {
	if(err === 'AUTH_UNREGISTERED') profile();
    if(err === 'AUTH_REQ_TO_POST') login( {requireAuth:1});
});

Stream.prototype.show = function() { var self = this;
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
	var text = this.text.value, parts, currentNick, tempThis/* sorry abt this.. but need to access this on callback*/;
	if(!text) return;
	Stream.text=this.text;//save text variable
	Stream.prevText=this.text.value;//prev value on TextField 
	this.text.value = '';
	
	if (text[0] == '/') {
		parts = text.substr(1).split(' ');
		switch (parts[0]) {
			case 'nick':
				currentNick = core.nick();
				if(currentNick.indexOf("guest-")!=0) {
					this.notify("You can't change your nick while you're signed in.");	
				}else {
					tempThis = this;
					core.nick("guest-"+parts[1], function(){
						tempThis.nick.innerHTML= parts[1];
						tempThis.rename();		
					});
				}
				return;
			case 'leave':
				if(scrollback.close) this.close();
				return;
		}
	}
	this.log.scrollTop = this.log.scrollHeight;
	core.say(this.id, text);
};

Stream.prototype.notify=function(str, persist) {
	var thisStream=this;
	if (!this.hidden) {
		this.alert.innerHTML="<span>"+str+"</span>";
		//this.alert.appendChild(JsonML.parse(["span", str]));
		removeClass(this.alert,"scrollback-alert-hidden");
		clearTimeout(this.alertTimer);
		
		if (!persist){
			this.alertTimer=setTimeout(function() {
				addClass(thisStream.alert,"scrollback-alert-hidden");
			},2000);	
		}
	}
}


Stream.prototype.onmessage = function(message) {
	var el = this.renderMessage(message),str="", oldTitle="",title="";
	if (message.type === "join" || message.type === "part") {
		return;
	}
	if (message.type == "text") {
		if (message.from != core.nick()) {
			browserNotify(message.from.replace(/^guest-/g, "")+" : "+message.text, hasClass(el, "scrollback-message-mentioned"));
		}
		if(this.titleText.innerText) {
			this.titleText.innerText = el.innerText;
		} else {
			this.titleText.textContent = el.textContent;
		}
	} else {
		if (core.nick()!==message.ref && message.ref!=message.from) {
			this.notify(el.innerText || el.textContent);
		}
	}

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
		if(window.scrollback.position && window.scrollback.position==="left") {
			console.log("pushing to left");
			col.style["left"] = (margin + i*pitch) + 'px';
		}else{
			col.style.right = (margin + i*pitch) + 'px';
		}
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

