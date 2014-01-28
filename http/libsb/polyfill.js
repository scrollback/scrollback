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

if (!Array.prototype.remove) {
	Array.prototype.remove = function (elt) {
		var i = this.indexOf(elt);
		if(i !== -1) return this.splice(i, 1);
	};
}

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (elt /*, from*/) {
		var len = this.length;
		var from = Number(arguments[1]) || 0; from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) { from += len; }
		for (; from < len; from++) {
			if (from in this && this[from] === elt) {
				return from;
			}
		}
		return -1;
	};
}

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
	console.log("uid="+str);
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
		return new RegExp('(\\s+|^)'+
				s.replace(/\W/g, function(m) {return '\\'+m;})+
			'(\\s+|$)', 'g');
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
	var d = new Date(parseInt(time, 10)), n = new Date(currTime),
		day_diff = (n.getTime()-d.getTime())/86400000,
		weekDays=["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
			"Friday", "Saturday"],
		months=["January", "February", "March", "April", "May", "June", "July",
			"August", "September", "October", "November", "December"],
		str = "";
	if (day_diff > 6) {
		str+=months[d.getMonth()] + ' ' + d.getDate();
		str = (d.getFullYear() !== n.getFullYear()? d.getFullYear() + ' ': '')+str;
	}
	else{
		str = str || day_diff > 1? weekDays[d.getDay()]: d.getDay()!=n.getDay()?
		'yesterday': '';
	}

	return str + ' at '+ d.getHours() + ':' +
		(d.getMinutes()<10? '0': '') + d.getMinutes();
}
