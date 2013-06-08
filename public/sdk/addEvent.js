/*	addEvent based on
	Quirksmode AddEvent contest entry by John Resig,
	added the FixEvent functionality by Dean Edwards
	
	@author Aravind.
	(c) Askabt
*/

function addEvent( obj, type, fn ) {
	if (obj.addEventListener)
		obj.addEventListener( type, fn, false );
	else if (obj.attachEvent) {
		obj["e"+type+fn] = fn;
		obj[type+fn] = function() {
			return obj["e"+type+fn]( addEvent.fixEvent(window.event) );
		};
		obj.attachEvent( "on"+type, obj[type+fn] );
	}
}

function removeEvent( obj, type, fn ) {
	if (obj.removeEventListener)
		obj.removeEventListener( type, fn, false );
	else if (obj.detachEvent) {
		obj.detachEvent( "on"+type, obj[type+fn] );
		obj[type+fn] = null;
		obj["e"+type+fn] = null;
	}
}

addEvent.fixEvent = function(event) {
  // add W3C standard event methods
  event.preventDefault = addEvent.preventDefault;
  event.stopPropagation = addEvent.stopPropagation;
  return event;
};

addEvent.preventDefault = function() {
  this.returnValue = false;
};

addEvent.stopPropagation = function() {
  this.cancelBubble = true;
};
