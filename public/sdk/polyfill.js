"use strict";

if(!Object.keys) Object.keys = function(o) {
	if (typeof o !== 'object' && typeof o !== 'function' || o === null) {
		throw new TypeError('Object.keys called on non-object');
	}
	var k=[], i;
	for(i in o) if(o.hasOwnProperty(i)) k.push(i);
	return k;
};

if (typeof Object.create !== "function") Object.create = function (o) {
	function F() {}
	F.prototype = o;
	return new F();
};

if(!Array.prototype.forEach) Array.prototype.forEach = function(fn, scope) {
	for(var i = 0, len = this.length; i < len; ++i) {
		fn.call(scope, this[i], i, this);
	}
};

if(!Array.prototype.map) Array.prototype.map = function(fn, scope) {
	var r = [];
	for(var i = 0, len = this.length; i < len; ++i) {
		r.push(fn.call(scope, this[i], i, this));
	}
	return r;
};

if (!window.console) {
	window.console = { log: function() {} };
}

function guid(n) {
    var str="", i;
	n = n || 32;
	for(i=0; i<n; i++) str += (Math.random()*36|0).toString(36);
	return str;
}

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

window.requestAnimationFrame = window.requestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		function(cb) { setTimeout(cb, 25); };


function prettyDate(time, currTime){
	var d = new Date(parseInt(time, 10)), n = new Date(currTime),
		day_diff = n.getDate() - d.getDate(),
		weekDays=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
			"Friday", "Saturday"],
		months=["January", "February", "March", "April", "May", "June", "July",
			"August", "September", "October", "November", "December"],
		str = "";
	
	str += d.getYear() !== n.getYear()? d.getYear() + ' ': '';
	str += (str || d.getMonth()!==n.getMonth() || day_diff > 6)?
		months[d.getMonth()] + ' ' + d.getDate(): '';
	
	str = str || day_diff > 1? weekDays[d.getDay()]: day_diff > 0?
		'yesterday': '';
	
	return str + ' at '+ d.getHours() + ':' +
		(d.getMinutes()<10? '0': '') + d.getMinutes();
}