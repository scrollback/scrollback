Stream.prototype.scroll = function() {
	var log = this.log, up, until = this.firstMessageAt;
	
	
	if(typeof this.lastScrollTop !== 'undefined' && until > 0 &&
		until != this.lastRequestedUntil
	) {
		up = log.scrollTop < this.lastScrollTop;
		if(log.scrollTop < log.clientHeight && up) {
			this.lastRequestedUntil = until;
			socket.emit('get', {to: this.id, until: until, type: "text"});
		}
	}
	
	this.renderThumb();
	
	if(log.scrollHeight - (log.scrollTop + log.clientHeight) < 16)
		this.scrolledUp = false;
	else
		this.scrolledUp = true;

	this.lastScrollTop = log.scrollTop;
};

Stream.prototype.renderThumb = function() {
	var log = this.log, msg = log.lastChild, pos,
		thumbTop = this.tread.clientHeight,
		thumbBottom = 0,
		viewTop = offset(log)[1] + log.scrollTop,
		viewBottom = viewTop + log.clientHeight;
		
	console.log("Timeline rendering");
	
	while(msg) {
		pos = offset(msg)[1];
		if(pos >= viewTop && pos <= viewBottom){
			pos = msg.getAttribute('data-time');
			pos = (pos - this.firstMessageAt) * this.tread.clientHeight /
				(this.lastMessageAt - this.firstMessageAt);
			if(pos < thumbTop) thumbTop = pos;
			if(pos > thumbBottom) thumbBottom = pos;
		}
		msg = msg.previousSibling;
	}
	
	thumbBottom = Math.min(thumbBottom, log.clientHeight);
	
	this.thumb.style.top = thumbTop + 'px';
	this.thumb.style.height = (thumbBottom - thumbTop +1) + 'px';
};

Stream.prototype.renderTimeline = function() {
	var buckets = [], h=1, n=this.tread.clientHeight, i,
		first = this.firstMessageAt, duration=this.lastMessageAt-first,
		msg = this.log.firstChild, color, r, ml = ["div"], max=0, frac;
	
	this.tread.innerHTML = '';
	
	while(msg) {
		i = Math.floor((msg.getAttribute('data-time') - first)*n / duration);
		if(!buckets[i]) buckets[i] = {nicks: {}, n: 0}
		buckets[i].nicks[msg.getAttribute('data-from')] = true;
		buckets[i].n += 1;
		if(buckets[i].n > max) max = buckets[i].n;
		msg = msg.nextSibling;
	}
	
	for(i=0; i<n; i++) {
		if(buckets[i]) {
			r = ["div", {
				'class': 'scrollback-tread-row scrollback-user-' +
					Object.keys(buckets[i].nicks).join(' scrollback-user-'),
				style: {
					top: (i*h) + 'px', width: (buckets[i].n*18/max) + 'px'
				}
			}];
			ml.push(r);
		}
	}
	
	this.tread.appendChild(JsonML.parse(ml));
	this.renderThumb();
};