/*
    EmbedKit
    A micro-framework for writing JavaScript embeds.
*/

/* eslint-env browser */
/* eslint no-trailing-spaces: 0 strict: 0 */
/* eslint quotes: [2, "single"] */

/*
  addEvent normalizes event behavior on IE. It's based on:
    Quirksmode AddEvent contest entry by John Resig,
    added the FixEvent functionality by Dean Edwards
	
  @author Aravind.
*/

var evt = (function () {
	var wrapped = {};
	
	function preventDefault () {
		this.returnValue = false;
	}

	function stopPropagation () {
		this.cancelBubble = true;
	}
	
	function fix (event) {
		// add W3C standard event methods
		event.preventDefault = preventDefault;
		event.stopPropagation = stopPropagation;
		return event;
	}

	function wrap(fn, add) {
		var i, wfn;
		if(!wrapped[fn]) {
			if(!add) {
				return undefined;
			} else {
				wrapped[fn] = [];
			}
		}
		
		for(i = 0; i < wrapped[fn].length; i++) {
			if(wrapped[fn][0] === fn) {
				return wrapped[fn][1];
			}
		}
		
		if(!add) { return undefined; }
		
		wfn = function () {
			return fn(fix(window.event));
		};

		wrapped[fn].push([fn, wfn]);
		return wfn;
	}
	
	return { 
		add: function add(elem, type, fn) {
			if (elem.addEventListener) {
				elem.addEventListener(type, fn, false);
			} else if (elem.attachEvent) {
				elem.attachEvent('on' + type, wrap(fn, true));
			}
		},
		remove: function remove (elem, type, fn) {
			if(elem.removeEventListener) {
				elem.removeEventListener(type, fn, false);
			} else if (elem.detachEvent) {
				elem.detachEvent('on' + type, wrap(fn, false));
			}
		}
	};
	
}());

/*
  addStyle adds inline style blocks (formatted as JSON or strings) to elements.
  @author Aravind.
*/

var addStyle = function(elem, value) {
	if(typeof value === 'object') {
		for(var cssName in value) if(value.hasOwnProperty(cssName)) {
			try { elem.style[cssName] = value[cssName]; }
			catch(e) { /* ignore, unsupported CSS property. */ }
		}
	} else if (typeof elem.style.cssText !== 'undefined') {
		elem.style.cssText = value;
	} else {
		elem.style = value;
	}
};

/*
  Element builds DOM elements from JsonML. See jsonml.org
  
  Highly stripped out version of the official JSONML parser, removing
  support for obsolete browsers, seldom-used HTML tags and code for
  correcting common mistakes. 
  
  @author aravind
*/

function element(jml) {
	try {
		if (!jml) {
			return null;
		}
		
		if (typeof jml === 'string') {
			return document.createTextNode(jml);
		}

		if (!(jml instanceof Array) || typeof jml[0] !== 'string') {
			throw new SyntaxError('Invalid JsonML');
		}

		var elem = document.createElement(jml[0]);

		for (var i = 1; i < jml.length; i++) {
			if (jml[i] instanceof Array || typeof jml[i] === 'string') { // child node
				elem.appendChild(element(jml[i]));
			} else if (typeof jml[i] === 'object' && jml[i] !== null) { // attributes object
				for (var name in jml[i]) {
					var value = jml[i][name];
					if (value === null || typeof value === 'undefined') {
						continue;
					}

					if (name === 'style') { // inline style
						addStyle(elem, value);
					} else if (name === 'class') { // className
						elem.className = value;
					} else if (typeof value === 'function') { // event handler
						evt.add(elem, name, value);
					} else if (
						typeof value === 'string' ||
						typeof value === 'number' ||
						typeof value === 'boolean'
					) {
						elem.setAttribute(name, value); // ordinary attribute
					} else {
						elem[name] = value; // something else
					}
				}
			}
		}
		return elem;
	} catch (ex) {
		throw new SyntaxError('Invalid JsonML');
	}
}


/*
  DomReady executes the callback when DOM is (or has been) loaded.
  
  @author aravind
*/

function DomReady(fn) {
	if (
		document.readyState === 'complete' ||
		document.readyState === 'loaded' ||
		document.readyState === 'interactive'
	) {
		fn();
	} else if (document.addEventListener) {
		document.addEventListener('DOMContentLoaded', fn, false);
	}
}
