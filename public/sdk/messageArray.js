"use strict";

function messageArray(initData) {
	var messages = initData || [];
	
	function save(key) {
		if(!window.localStorage) return;
		window.localStorage[key] = JSON.stringify(messages);
	}

	function load(key) {
		
		return; // there seems to be some bug since this module does not work correctly with all browsers.  
		
		if(!window.localStorage) return;
		try {
			[].splice.apply(messages,[0,messages.length].concat(JSON.parse(window.localStorage[key] || '[]')));
		} catch (e) {
			[].splice.apply(messages,[0,messages.length]);
		}
	}

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
	
	function merge (data) {
		if (!data.length) return;		
		var startTime = data[0].time, endTime = data[data.length-1].time,
			start = find(startTime),
			end = find(endTime);
		
		while (messages[start-1] && messages[start-1].time == startTime) {
			start++;
		}
		
		while (messages[end] && messages[end].time == endTime) {
			end--;
		}

//		console.log("Ready to merge", messages, data, start, end);
		
		if (messages[start] && messages[start].type != 'result-start' && data[0].type == 'result-end') {
			data.shift();
		}
		
		if (messages[end-1] && messages[end-1].type != 'result-end' && data[data.length-1].type == 'result-start') {
			data.pop();
		}
		
		[].splice.apply(messages, [end, start-end].concat(data));
//		console.log("After it all, messages has", messages, this);
	}
	
	function extract(time, before, after, missing) {
		var res = [], mid, i, l = messages.length, c, m, start = null;
		
		
		if (!time && missing) {
			res.push(missing(null, null));
			time = 1E13;
		}
		
		mid = find(time);
		
		for (i=mid, c=0; i>0 && c<before; i--) {
			if (messages[i] && messages[i].type == 'text') c++;
		}
		
		for (c=0; i<l && c<before+after+1; i++) {
			m = messages[i];
			switch (m.type) {
				case 'result-start':
					if (missing) {
						res.push(missing(start, m.time));
					}
					break;
				case 'result-end':
					start = m.time;
					break;
				case 'text':
					res.push(m);
					c++;
					break;
			}
		}
		if (m && m.type == 'result-end' && missing) {
			res.push(missing(m.time, null));
		}
		
		return res;
	}
	
	messages.merge = merge;
	messages.find = find;
	messages.extract = extract;
	
	messages.load = load;
	messages.save = save;
	return messages;
}

//// --- for testing in node.
//if (module && module.exports) {
//	module.exports = messageArray;
//}
//
