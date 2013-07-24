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
	"use strict";
	var elements, pattern, i, l, results = [];
	
	if(d.getElementsByClassName) {
		return [].slice.apply(d.getElementsByClassName(search));
	} else if (d.querySelectorAll) { // IE8
		elements=d.querySelectorAll("." + search);
		for (i=0, l=elements.length; i<l; i++) {
			results.push(elements[i]);
		}
	} else if (d.evaluate) { // IE6, IE7
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
