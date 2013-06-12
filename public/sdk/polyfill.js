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
		return new RegExp('(\\s|^)'+
				s.replace(/\W/g, function(m) {return '\\'+m;})+
			'(\\s|$)', 'g');
	} catch(e) {
		return null;
	}
}

function hasClass(obj, cl) {
	return regex(cl).test(obj.className);
}

function removeClass(obj, cl) {
	obj.className = obj.className.replace(regex(cl), ' ');
}

function addClass(obj, cl) {
	removeClass(obj, cl);
	obj.className = obj.className + ' ' + cl;
}

function prettyDate(time, currTime){
	var d = new Date(time), n = new Date(currTime),
		day_diff = n.getDate() - d.getDate(),
		weekDays=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
			"Friday", "Saturday"],
		months=["January", "February", "March", "April", "May", "June", "July",
			"August", "September", "October", "November", "December"],
		str = "";
	
	str += d.getYear() !== n.getYear()? d.getYear() + ' ': '';
	str += (str || d.getMonth()!==n.getMonth() || day_diff > 6)?
		months[d.getMonth()] + ' ' + d.getDate() + ', ': '';
	
	str = str || day_diff > 1? weekDays[d.getDay()]: day_diff > 0?
		'Yesterday ': '';
	
	return str + d.getHours() + ':' +
		(d.getMinutes()<10? '0': '') + d.getMinutes();
}

