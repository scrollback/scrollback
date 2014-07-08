"use strict";
function ArrayCache(initData) {
	this.d = initData || [];
}

ArrayCache.prototype.getItems = function(){
	return this.d;
};

ArrayCache.prototype.find = function (time, start, end) {
		var pos;

		if (typeof start === 'undefined') {
			return this.find(time, 0, this.d.length);
		}
		
		if (!time) {
			return end;
		}
		if (start >= end) return start;
		pos = ((start + end)/2) | 0;
		
		if (this.d[pos] && this.d[pos].time < time) {
			return this.find(time, pos+1, end);
		} else if (this.d[pos-1] && this.d[pos-1].time >= time) {
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
		
		while (/* data[0].endtype && data[0].endtype == 'time' && */this.d[start-1] && this.d[start-1].time == startTime) {
			start--;
		}
		
		while (/* data[data.length-1].endtype && data[data.length-1].endtype == 'time' && */ this.d[end] && this.d[end].time == endTime) {
			end++;
		}
	
		if ((
			!this.d[start-1] && this.d[start] && this.d[start].type != 'result-start'
		) || (
			this.d[start-1] && this.d[start-1].type != 'result-end' && data[0].type == 'result-start'
		)) {
			data.shift();
		}
		if ((
			!this.d[end] && this.d[end-1] && this.d[end-1].type != 'result-end'
		) || (
			this.d[end] && this.d[end].type != 'result-start' && data[data.length-1].type == 'result-end'
		)) {
			data.pop();
		}
	
		
		[].splice.apply(this.d, [start, end - start].concat(data));
};

ArrayCache.prototype.get = function (query) {
	var time = query.time, 
		before = Math.max(0,query.before||0),
		after = Math.max(0,query.after||0),
		partials = query.partials || false,
		pos, l = this.d.length, self = this;
	
	pos = time? this.find(time): l;
	
	function walk(start, steps, direction) {
		var res = [], m, i;
		for(i=start; i>=0 && i<l && res.length<steps; i+=direction) {
			m = self.d[i];
			if(typeof m !== 'object') throw new Error('ArrayCache contains non-object');
			if(m.type == 'result-start') {
				if(!partials) return null;
			} else if(m.type == 'result-end') {
				if(partials) {
					res.push({type: 'missing', time: m.time });
				} else return null;
			} else res.push(m);
		}
		
		return direction<0? res.reverse(): res;
	}
	
	if(before) {
		while(this.d[pos] && this.d[pos].time == time) pos++;
		return walk(pos-1, before, -1);
	} else if(after) {
		while(this.d[pos] && this.d[pos].time == time) pos--;
		return walk(pos+1, after, 1);
	}
	return null;
};

module.exports = ArrayCache;