if(!Object.keys) Object.keys = function(o) {
	var k=[], i;
	for(i in o) if(o.hasOwnProperty(i)) k.push(i);
	return k;
};

function offset(obj) {
	var l=0, t=0;
	while(obj) {
		l += obj.offsetLeft; t += obj.offsetTop; obj = obj.offsetParent;
	}
	return [l, t];
}
