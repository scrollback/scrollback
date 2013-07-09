"use strict";

function messageArray() {
	var messages = [];
	
	function find (time, start, end) {
		var pos;
		
		if (typeof start === 'undefined') {
			return find(time, 0, messages.length);
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
	
	function merge (data) {
		var startTime = data[0].time, endTime = data[data.length-1].time,
			start = find(startTime),
			end = find(endTime);
		
		while (
			messages[start] && messages[start].time == startTime //&&
//			messages[start].type != 'result-end'
		) start++;
		
		while (
			messages[end-1] && messages[end-1].time == endTime //&&
//			messages[end-1].type != 'result-start'
		) end--;
		
		if (messages[start-1] && messages[start-1].type != 'result-end') {
			data.shift();
		}
		
		if (messages[end] && messages[end].type != 'result-start') {
			data.pop();
		}
		
		if (messages[start-1] && messages[start-1].id &&
			messages[start-1].id == data[0].id) {
			data.shift();
		}
		
		if (messages[end] && messages[end].id &&
			messages[end].id == data[data.length-1].id) {
			data.pop();
		}
		
		[].splice.apply(messages, [start, end - start].concat(data));
	}
	
	function extract(time, before, after, missing) {
		var res = [],
			start,
			i, m, gap = true, gapStart;
		
		start = find(time);
		
		if (messages.length) {
			for (i=start-1; i>=0 && i>=start - before; i--) {
				m = check(i, false);
				if (m) res.unshift(m);
			}
			for (i=start; i<messages.length && i<start + after; i++) {
				m = check(i, true);
				if(m) res.push(m);
			}
		}
		
		function check(i, forward) {
			var m = messages[i];
			if (m.type == 'result-start') {
				if (!forward && missing) {
					return missing(null, m.time);
				}
				return false;
			} else if (m.type == 'result-end') {
				if (forward && missing) {
					return missing(m.time, null);
				}
				return false;
			}
			return m;
		}
		
		return res;
	}
	
	messages.merge = merge;
	messages.find = find;
	messages.extract = extract;
	
	return messages;
}



