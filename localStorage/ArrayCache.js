function messageArray(initData){

	var messages = initData || [];

	function find(time, start, end){
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

	function merge(data){
		// merge and remove duplicates
		if(!data.length) return;
		var merged = [], res = [];
		var unique = {};
		var i = 0, j = 0, k = 0; 

		while(i < messages.length && j < data.length){
			if(messages[i].time < data[j].time){
				 merged[k++] = messages[i++];
			}
			else{
				merged[k++] = data[j++];
			}
		}
		while(i < messages.length) {
			merged[k++] = messages[i++];
		}
		while(j < data.length){
			merged[k++] = data[j++];
		}
		// filter merged to remove duplicates
		merged.forEach(function(msg){
			if (!unique.hasOwnProperty(msg.id)){
				unique[msg.id] = "";
				res.push(msg);
			}
		});
		messages = res;
	}

	function get(query){
		var time = query.time, before = query.before, after = query.after;
		var pos = find(time);
		var tmpMsg = messages.slice(0);
		if(pos - before < 0) return;
		else if(pos + after > tmpMsg.length - 1) return;
		else return tmpMsg.splice(pos-before, before + after + 1);
	}

	messages.merge = merge;
	messages.find = find;
	messages.get = get;

	return messages; 
}