/*global JSON */
/*
	
	Dependencies added by Aravind::
		- addEvent.js - normalized event objects for IE.
		- addStyle.js - JSON representation of inline and block CSS
	
	jsonml2.js
	JsonML builder

	Created: 2006-11-09-0116
	Modified: 2010-09-13-1952

	Copyright (c)2006-2010 Stephen M. McKamey
	Distributed under The MIT License: http://jsonml.org/license

	This file creates a global JsonML object containing these methods:

		JsonML.parse(string|array, filter)

			This method produces a tree of DOM elements from a JsonML tree. The
			array must not contain any cyclical references.

			The optional filter parameter is a function which can filter and
			transform the results. It receives each of the DOM nodes, and
			its return value is used instead of the original value. If it
			returns what it received, then structure is not modified. If it
			returns undefined then the member is deleted.

			This is useful for binding unobtrusive JavaScript to the generated
			DOM elements.

			Example:

			// Parses the structure. If an element has a specific CSS value then
			// takes appropriate action: Remove from results, add special event
			// handlers, or bind to a custom component.

			var myUI = JsonML.parse(myUITemplate, function (elem) {
				if (elem.className.indexOf('Remove-Me') >= 0) {
					// this will remove from resulting DOM tree
					return null;
				}

				if (elem.tagName && elem.tagName.toLowerCase() === 'a' &&
					elem.className.indexOf('External-Link') >= 0) {
					// this is the equivalent of target='_blank'
					elem.onclick = function(evt) {
						window.open(elem.href); return false;
					};

				} else if (elem.className.indexOf('Fancy-Widgit') >= 0) {
					// bind to a custom component
					FancyWidgit.bindDOM(elem);
				}
				return elem;
			});

			// Implement onerror to handle any runtime errors while binding:
			JsonML.onerror = function (ex, jml, filter) {
				// display inline error message
				return document.createTextNode('['+ex+']');
			};

		Utility methods for manipulating JsonML elements:

			// tests if a given object is a valid JsonML element
			bool JsonML.isElement(jml);

			// gets the name of a JsonML element
			string JsonML.getTagName(jml);

			// tests if a given object is a JsonML attributes collection
			bool JsonML.isAttributes(jml);

			// tests if a JsonML element has a JsonML attributes collection
			bool JsonML.hasAttributes(jml);

			// gets the attributes collection for a JsonML element
			object JsonML.getAttributes(jml);

			// sets multiple attributes for a JsonML element
			void JsonML.addAttributes(jml, attr);

			// gets a single attribute for a JsonML element
			object JsonML.getAttribute(jml, key);

			// sets a single attribute for a JsonML element
			void JsonML.setAttribute(jml, key, value);

			// appends a JsonML child node to a parent JsonML element
			void JsonML.appendChild(parent, child);

			// gets an array of the child nodes of a JsonML element
			array JsonML.getChildren(jml);
*/

var JsonML = JsonML || {};

(function(JsonML) {
	'use strict';

	//attribute name mapping
	var ATTRMAP = {
			rowspan : 'rowSpan',
			colspan : 'colSpan',
			cellpadding : 'cellPadding',
			cellspacing : 'cellSpacing',
			tabindex : 'tabIndex',
			accesskey : 'accessKey',
			hidefocus : 'hideFocus',
			usemap : 'useMap',
			maxlength : 'maxLength',
			readonly : 'readOnly',
			contenteditable : 'contentEditable'
			// can add more attributes here as needed
		},

		// attribute duplicates
		ATTRDUP = {
			enctype : 'encoding',
			onscroll : 'DOMMouseScroll'
			// can add more attributes here as needed
		},

		// event names
		EVTS = (function(/*string[]*/ names) {
			var evts = {};
			while (names.length) {
				var evt = names.shift();
				evts['on'+evt.toLowerCase()] = evt;
			}
			return evts;
		})('blur,change,click,dblclick,error,focus,keydown,keypress,keyup,load,mousedown,mouseenter,mouseleave,mousemove,mouseout,mouseover,mouseup,resize,scroll,select,submit,unload'.split(','));

	/*void*/ function addHandler(/*DOM*/ elem, /*string*/ name, /*function*/ handler) {
		if ('string' === typeof handler) {
			/*jslint evil:true */
			handler = new Function('event', handler);
			/*jslint evil:false */
		}

		if ('function' !== typeof handler) {
			return;
		}
		
		addEvent(elem, EVTS[name], handler);
		
//		elem[name] = handler;
	}

	/*DOM*/ function addAttributes(/*DOM*/ elem, /*object*/ attr) {
		if (attr.name && document.attachEvent) {
			try {
				// IE fix for not being able to programatically change the name attribute
				var alt = document.createElement('<'+elem.tagName+' name="'+attr.name+'">');
				// fix for Opera e8.5 and Netscape 7.1 creating malformed elements
				if (elem.tagName === alt.tagName) {
					elem = alt;
				}
			} catch (ex) { }
		}

		// for each attributeName
		for (var name in attr) {
			if (attr.hasOwnProperty(name)) {
				// attributeValue
				var value = attr[name];
				if (name && value !== null && 'undefined' !== typeof value) {
					name = ATTRMAP[name.toLowerCase()] || name;
					if (name === 'style') {
						setStyle(elem, value);
					} else if (name === 'class') {
						elem.className = value;
					} else if (EVTS[name]) {
						addHandler(elem, name, value);

						// also set duplicated events
						if (ATTRDUP[name]) {
							addHandler(elem, ATTRDUP[name], value);
						}
					} else if ('string' === typeof value || 'number' === typeof value || 'boolean' === typeof value) {
						elem.setAttribute(name, value);

						// also set duplicated attributes
						if (ATTRDUP[name]) {
							elem.setAttribute(ATTRDUP[name], value);
						}
					} else {

						// allow direct setting of complex properties
						elem[name] = value;

						// also set duplicated attributes
						if (ATTRDUP[name]) {
							elem[ATTRDUP[name]] = value;
						}
					}
				}
			}
		}
		return elem;
	}

	/*void*/ function appendChild(/*DOM*/ elem, /*DOM*/ child) {
		if (child) {
			if (elem.tagName && elem.tagName.toLowerCase() === 'table' && elem.tBodies) {
				if (!child.tagName) {
					// must unwrap documentFragment for tables
					if (child.nodeType === 11) {
						while (child.firstChild) {
							appendChild(elem, child.removeChild(child.firstChild));
						}
					}
					return;
				}
				// in IE must explicitly nest TRs in TBODY
				var childTag = child.tagName.toLowerCase();// child tagName
				if (childTag && childTag !== 'tbody' && childTag !== 'thead') {
					// insert in last tbody
					var tBody = elem.tBodies.length > 0 ? elem.tBodies[elem.tBodies.length-1] : null;
					if (!tBody) {
						tBody = document.createElement(childTag === 'th' ? 'thead' : 'tbody');
						elem.appendChild(tBody);
					}
					tBody.appendChild(child);
				} else if (elem.canHaveChildren !== false) {
					elem.appendChild(child);
				}
			} else if (elem.tagName && elem.tagName.toLowerCase() === 'style' && document.createStyleSheet) {
				// IE requires this interface for styles
				elem.cssText = child;
			} else if (elem.canHaveChildren !== false) {
				elem.appendChild(child);
			} else if (elem.tagName && elem.tagName.toLowerCase() === 'object' &&
				child.tagName && child.tagName.toLowerCase() === 'param') {
					// IE-only path
					try {
						elem.appendChild(child);
					} catch (ex1) {}
					try {
						if (elem.object) {
							elem.object[child.name] = child.value;
						}
					} catch (ex2) {}
			}
		}
	}

	/*bool*/ function isWhitespace(/*DOM*/ node) {
		return node && (node.nodeType === 3) && (!node.nodeValue || !/\S/.exec(node.nodeValue));
	}

	/*void*/ function trimWhitespace(/*DOM*/ elem) {
		if (elem) {
			while (isWhitespace(elem.firstChild)) {
				// trim leading whitespace text nodes
				elem.removeChild(elem.firstChild);
			}
			while (isWhitespace(elem.lastChild)) {
				// trim trailing whitespace text nodes
				elem.removeChild(elem.lastChild);
			}
		}
	}

	/*DOM*/ function hydrate(/*string*/ value) {
		var wrapper = document.createElement('div');
		wrapper.innerHTML = value;

		// trim extraneous whitespace
		trimWhitespace(wrapper);

		// eliminate wrapper for single nodes
		if (wrapper.childNodes.length === 1) {
			return wrapper.firstChild;
		}

		// create a document fragment to hold elements
		var frag = document.createDocumentFragment ?
			document.createDocumentFragment() :
			document.createElement('');

		while (wrapper.firstChild) {
			frag.appendChild(wrapper.firstChild);
		}
		return frag;
	}

	function Unparsed(/*string*/ value) {
		this.value = value;
	}

	JsonML.raw = function(/*string*/ value) {
		return new Unparsed(value);
	};

	// default error handler
	/*DOM*/ function onError(/*Error*/ ex, /*JsonML*/ jml, /*function*/ filter) {
		return document.createTextNode('['+ex+']');
	}

	/* override this to perform custom error handling during binding */
	JsonML.onerror = null;

	/*DOM*/ function patch(/*DOM*/ elem, /*JsonML*/ jml, /*function*/ filter) {

		for (var i=1; i<jml.length; i++) {
			if (jml[i] instanceof Array || 'string' === typeof jml[i]) {
				// append children
				appendChild(elem, JsonML.parse(jml[i], filter));
			} else if (jml[i] instanceof Unparsed) {
				appendChild(elem, hydrate(jml[i].value));
			} else if ('object' === typeof jml[i] && jml[i] !== null && elem.nodeType === 1) {
				// add attributes
				elem = addAttributes(elem, jml[i]);
			}
		}

		return elem;
	}

	/*DOM*/ JsonML.parse = function(/*JsonML*/ jml, /*function*/ filter) {
		try {
			if (!jml) {
				return null;
			}
			if ('string' === typeof jml) {
				return document.createTextNode(jml);
			}
			if (jml instanceof Unparsed) {
				return hydrate(jml.value);
			}
			if (!JsonML.isElement(jml)) {
				throw new SyntaxError('invalid JsonML');
			}

			var tagName = jml[0]; // tagName
			if (!tagName) {
				// correctly handle a list of JsonML trees
				// create a document fragment to hold elements
				var frag = document.createDocumentFragment ?
					document.createDocumentFragment() :
					document.createElement('');
				for (var i=1; i<jml.length; i++) {
					appendChild(frag, JsonML.parse(jml[i], filter));
				}

				// trim extraneous whitespace
				trimWhitespace(frag);

				// eliminate wrapper for single nodes
				if (frag.childNodes.length === 1) {
					return frag.firstChild;
				}
				return frag;
			}

			if (tagName.toLowerCase() === 'style' && document.createStyleSheet) {
				// IE requires this interface for styles
				JsonML.patch(document.createStyleSheet(), jml, filter);
				// in IE styles are effective immediately
				return null;
			}

			var elem = patch(document.createElement(tagName), jml, filter);

			// trim extraneous whitespace
			trimWhitespace(elem);
			return (elem && 'function' === typeof filter) ? filter(elem) : elem;
		} catch (ex) {
			try {
				// handle error with complete context
				var err = ('function' === typeof JsonML.onerror) ? JsonML.onerror : onError;
				return err(ex, jml, filter);
			} catch (ex2) {
				return document.createTextNode('['+ex2+']');
			}
		}
	};

	// interface for internal JsonML.BST use
	JsonML.patch = function(/*DOM*/ elem, /*JsonML*/ jml, /*function*/ filter) {
		return patch(elem, jml, filter);
	};

	/* Utility Methods -------------------------*/

	/*bool*/ JsonML.isElement = function(/*JsonML*/ jml) {
		return (jml instanceof Array) && ('string' === typeof jml[0]);
	};

	/*bool*/ JsonML.isFragment = function(/*JsonML*/ jml) {
		return (jml instanceof Array) && (jml[0] === '');
	};

	/*string*/ JsonML.getTagName = function(/*JsonML*/ jml) {
		return jml[0] || '';
	};

	/*bool*/ JsonML.isAttributes = function(/*JsonML*/ jml) {
		return !!jml && ('object' === typeof jml) && !(jml instanceof Array);
	};

	/*bool*/ JsonML.hasAttributes = function(/*JsonML*/ jml) {
		if (!JsonML.isElement(jml)) {
			throw new SyntaxError('invalid JsonML');
		}

		return JsonML.isAttributes(jml[1]);
	};

	/*object*/ JsonML.getAttributes = function(/*JsonML*/ jml, /*bool*/ addIfMissing) {
		if (JsonML.hasAttributes(jml)) {
			return jml[1];
		}

		if (!addIfMissing) {
			return undefined;
		}

		// need to add an attribute object
		var name = jml.shift();
		var attr = {};
		jml.unshift(attr);
		jml.unshift(name||'');
		return attr;
	};

	/*void*/ JsonML.addAttributes = function(/*JsonML*/ jml, /*object*/ attr) {
		if (!JsonML.isElement(jml) || !JsonML.isAttributes(attr)) {
			throw new SyntaxError('invalid JsonML');
		}

		if (!JsonML.isAttributes(jml[1])) {
			// just insert attributes
			var name = jml.shift();
			jml.unshift(attr);
			jml.unshift(name||'');
			return;
		}

		// merge attribute objects
		var old = jml[1];
		for (var key in attr) {
			if (attr.hasOwnProperty(key)) {
				old[key] = attr[key];
			}
		}
	};

	/*string|number|bool*/ JsonML.getAttribute = function(/*JsonML*/ jml, /*string*/ key) {
		if (!JsonML.hasAttributes(jml)) {
			return undefined;
		}
		return jml[1][key];
	};

	/*void*/ JsonML.setAttribute = function(/*JsonML*/ jml, /*string*/ key, /*string|number|bool*/ value) {
		JsonML.getAttributes(jml, true)[key] = value;
	};

	/*void*/ JsonML.appendChild = function(/*JsonML*/ parent, /*array|object|string*/ child) {
		if (child instanceof Array && child[0] === '') {
			// result was multiple JsonML sub-trees (i.e. documentFragment)
			child.shift();// remove fragment ident

			// directly append children
			while (child.length) {
				JsonML.appendChild(parent, child.shift(), arguments[2]);
			}
		} else if (child && 'object' === typeof child) {
			if (child instanceof Array) {
				if (!JsonML.isElement(parent) || !JsonML.isElement(child)) {
					throw new SyntaxError('invalid JsonML');
				}

				if ('function' === typeof arguments[2]) {
					// onAppend callback for JBST use
					arguments[2](parent, child);
				}

				// result was a JsonML node
				parent.push(child);
			} else if (child instanceof Unparsed) {
				if (!JsonML.isElement(parent)) {
					throw new SyntaxError('invalid JsonML');
				}

				// result was a JsonML node
				parent.push(child);
			} else {
				// result was JsonML attributes
				JsonML.addAttributes(parent, child);
			}
		} else if ('undefined' !== typeof child && child !== null) {
			if (!(parent instanceof Array)) {
				throw new SyntaxError('invalid JsonML');
			}

			// must convert to string or JsonML will discard
			child = String(child);

			// skip processing empty string literals
			if (child && parent.length > 1 && 'string' === typeof parent[parent.length-1]) {
				// combine strings
				parent[parent.length-1] += child;
			} else if (child || !parent.length) {
				// append
				parent.push(child);
			}
		}
	};

	/*array*/ JsonML.getChildren = function(/*JsonML*/ jml) {
		if (JsonML.hasAttributes(jml)) {
			jml.slice(2);
		}

		jml.slice(1);
	};

})(JsonML);