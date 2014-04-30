"use strict";

function messageArray(initData) {
	var messages = initData || [];
	function edit(obj) {
		var i,index, pos = find(obj.old.time-1 ), newLabels = [];

		for(i=pos; i<pos+10 && i < messages.length;i++) {
			if(messages[i].id === obj.old.id) {
				newLabels = messages[i].labels.map(function(ele){
					return ele;
				});

				Object.keys(obj.labels).forEach(function (label) {
					if(obj.labels[label]) {
						if(newLabels.indexOf(label) < 0) {
							newLabels.push(label);
						}
					}else if(typeof obj.labels[label]!="undefined"){
						if(newLabels.indexOf(label) >= 0) {
							newLabels.splice(newLabels.indexOf(label) , 1);
						}
					}
				});
				messages[i].labels = newLabels;
				return;
			}
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
		
// TODO: THIS SHOULD BE DONE ONLY FOR the end with specified time

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
	messages.edit = edit;
	return messages;
}

//// --- for testing in node.
//if (module && module.exports) {
//	module.exports = messageArray;
//}
//
