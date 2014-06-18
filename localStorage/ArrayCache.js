"use strict";
 var __ = require('underscore');

function ArrayCache(initData) {
	this.messages = initData || [];
}

ArrayCache.prototype.messages = [];

ArrayCache.prototype.getItems = function(){
	return this.messages;
};

ArrayCache.prototype.find = function (time, start, end) {
		var pos;

		if (typeof start === 'undefined') {
			return this.find(time, 0, this.messages.length);
		}
		
		if (!time) {
			return end;
		}
		if (start >= end) return start;
		pos = ((start + end)/2) | 0;
		
		if (this.messages[pos] && this.messages[pos].time < time) {
			return this.find(time, pos+1, end);
		} else if (this.messages[pos-1] && this.messages[pos-1].time >= time) {
			return this.find(time, start, pos-1);
		} else {
			return pos;
		}
};

ArrayCache.prototype.put = function(data) {
		if (!data.length) return;		
		var startTime = data[0].time, endTime = data[data.length-1].time,
			start = this.find(startTime),
			end = this.find(endTime);
		
		while (data[0].endtype && data[0].endtype == 'time' && this.messages[start-1] && this.messages[start-1].time == startTime) {
			start--;
		}
		
		while (data[data.length-1].endtype && data[data.length-1].endtype == 'time' && this.messages[end] && this.messages[end].time == endTime) {
			end++;
		}
		
		if (this.messages[start-1] && this.messages[start-1].type != 'result-end' && data[0].type == 'result-start') {
			data.shift();
		}
		
		if (this.messages[end] && this.messages[end].type != 'result-start' && data[data.length-1].type == 'result-end') {
			data.pop();
		}
		[].splice.apply(this.messages, [start, end - start].concat(data));
		this.messages = __.uniq(this.messages, function(item){
            return item.id;
        });
};

ArrayCache.prototype.get = function (query) {
        this.messages = __.uniq(this.messages, function(item){
            return item.id;
        });
		if(query.time === null){
			return null;	
		}

		var time = query.time, before = query.before, after = query.after,
			res = [], pos, i, l = this.messages.length, c, m;
	
			pos = time?this.find(time): l-1;


		for(i=-before; i<after; i++) {
			c = pos + i;
			if(c<0) i-=c;
			if(c>=l) break;
			m = this.messages[c];
			if(!m || m.type == 'result-start' || m.type == 'result-end') return null;
			if(m.type == "text") res.push(m);
		}
		return res;
};

module.exports = ArrayCache;