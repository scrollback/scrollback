"use strict";

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

function regex(s) {
	try {
		return new RegExp('\\s?\\b'+
				s.replace(/\W/g, function(m) {return '\\'+m;})+
			'\\b', 'g');
	} catch(e) {
		return null;
	}
}

function hasClass(obj, cl) {
	return regex(cl).test(obj.className);
}

function removeClass(obj, cl) {
	obj.className = obj.className.replace(regex(cl),'');
}

function addClass(obj, cl) {
	removeClass(obj, cl);
	obj.className = obj.className + ' ' + cl;
}

