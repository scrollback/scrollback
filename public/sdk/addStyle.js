var setStyle = function(elem, value) {
	if('object' === typeof value) {
		for(var cssName in value) if(value.hasOwnProperty(cssName)) {
			try { elem.style[cssName] = value[cssName]; }
			catch(e) { /* ignore, unsupported CSS property. */ }
		}
	} else if ('undefined' !== typeof elem.style.cssText) {
		elem.style.cssText = value;
	} else {
		elem.style = value;
	}
};

var addStyles = function(style) {
	var prop, selector, css="";
	
	function rule(prop, value) {
		var i, l, css="";
		prop = prop.replace(/([A-Z]?)([a-z]*)/g, function(m, u, r) {
			if(u) return '-' + u.toLowerCase() + r;
			else switch(r) {
				case 'webkit': case 'moz': case 'ms': case 'o':
					return '-' + r;
				default:
					return r;
			}
		});
		
		if(typeof value==="object" && (l=value.length)) for(i=0; i<l; i++) {
			css += prop + ":" + value[i] + "; ";
		} else {
			css += prop + ":" + value + "; ";
		}
		return css;
	}
	
	if(typeof style === "object") {
		for(selector in style) if(style.hasOwnProperty(selector)) {
			css += selector + " { ";
			for(prop in style[selector]) if(style[selector].hasOwnProperty(prop)) {
				css += rule(prop, style[selector][prop]);
			}
			css += " } ";
		}
	} else {
		css = style;
	}
	
	var el = document.createElement("style");
	document.getElementsByTagName("head")[0].appendChild(el);

	// append necessary in IE8 to populate styleSheet property.
	if (el.styleSheet) {
		el.styleSheet.cssText = css;
	} else {
		el.appendChild(document.createTextNode(css));
	}

	return el;
};
