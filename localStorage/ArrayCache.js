"use strict";

function ArrayCache(initData) {
	var messages = initData || [];

	function find (time, start, end) {
		var pos;

		if (typeof start === 'undefined') {
			return find(time, 0, messages.length);
		}
		
		if (!time) {
			return end;
		}
		if (start >= end) return start;
		pos = ((start + end)/2) | 0;
		
		if (messages[pos] && messages[pos].time < time) {
			return find(time, pos+1, end);
		} else if (messages[pos-1] && messages[pos-1].time >= time) {
			return find(time, start, pos-1);
		} else {
			return pos;
		}
	}
	
	function put(data) {
		if (!data.length) return;		
		var startTime = data[0].time, endTime = data[data.length-1].time,
			start = find(startTime),
			end = find(endTime);
		
		while (data[0].endtype && data[0].endtype == 'time' && messages[start-1] && messages[start-1].time == startTime) {
			start--;
		}
		
		while (data[data.length-1].endtype && data[data.length-1].endtype == 'time' && messages[end] && messages[end].time == endTime) {
			end++;
		}
		
		if (messages[start-1] && messages[start-1].type != 'result-end' && data[0].type == 'result-start') {
			data.shift();
		}
		
		if (messages[end] && messages[end].type != 'result-start' && data[data.length-1].type == 'result-end') {
			data.pop();
		}
		
		[].splice.apply(messages, [start, end - start].concat(data));
	}
	
	function get(query) {
		var time = query.time, before = query.before, after = query.after,
			res = [], pos, i, l = messages.length, c, m, start = null;
		
		pos = time? find(time): l-1;

		for(i=-before; i<after; i++) {
			c = mid + i;
			if(c<0) i-=c;
			if(c>=l) break;
			m = messages[c];
			if(m.type == 'result-start' || m.type == 'result-end') return null;
			res.push(m);
		}

		return res;
	}
	
	messages.put = put;
	messages.get = get;
	return messages;
}
