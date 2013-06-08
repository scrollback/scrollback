/*	Add a getElementsByClassName function if the browser doesn't have one
 *	Limitation: only works with one class name
 *
 *	Modified by Aravind to add functionality to Element.prototype also.
 *	
 *
 *	Original copyright: Eike Send http://eike.se/nd
 *	License: MIT License
 */

function getByClass (d, search) {
	var elements, pattern, i, results = [];
	
	if(d.getElementsByClassName) {
		d.getElementsByClassName(search);
	}
	
	if (d.querySelectorAll) { // IE8
		return d.querySelectorAll("." + search);
	}
	
	if (d.evaluate) { // IE6, IE7
		pattern = ".//*[contains(concat(' ', @class, ' '), ' " + search + " ')]";
		elements = d.evaluate(pattern, d, null, 0, null);
		while ((i = elements.iterateNext())) {
			results.push(i);
		}
	} else {
		elements = d.getElementsByTagName("*");
		pattern = new RegExp("(^|\\s)" + search + "(\\s|$)");
		for (i = 0; i < elements.length; i++) {
			if ( pattern.test(elements[i].className) ) {
				results.push(elements[i]);
			}
		}
	}
	return results;
}
