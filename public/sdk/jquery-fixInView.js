(function($) {
	/* jshint browser: true */
	/* global jQuery */
	
	var columns = [],
		$window = $(window),
		$body = $(document.body),
		viewHeight = $window.height(), lineHeight;
		
	(function () {
		var lhs = $body.css('lineHeight');
		
		lineHeight = parseFloat(lhs);
		if(lhs.substr(-2) != 'px') {
			lineHeight = (isNaN(lineHeight)? 1.5: lineHeight) * parseFloat($body.css('fontSize'));
		}
	}());
	
	$.fn.fixInView = function() {
		this.each(function () {
			var el = $(this),
				column = { element: el, anchorBottom: false };
			columns.push(column);
			el.css({position: 'fixed'});
			el.data("column", column);
		});
		setup();
	};
	
	function read() {
		viewHeight = $window.height();
		columns.forEach(readColumn);
	}

	function readColumn(column) {
		column.top = column.element.offset().top - $window.scrollTop();
		column.height = column.element.outerHeight();
		column.bottom = viewHeight - (column.top + column.height);
//		if(column.element.attr('id') == 'body') console.log('Read', column.top, column.bottom, column.anchorBottom);
	}
	
	function moveView(movement) {
		columns.forEach(function (column) {
			var t = column.top;
			moveColumn(column, -movement);
			if(column.top != t) setTimeout(function() { trigger(column, column.top - t); }, 100);
		});
	}
	
	function moveColumn(column, movement) {
		column.top += movement; column.bottom -= movement;
		if(column.top > 0) { column.top = 0; column.bottom = viewHeight - column.height; }
		else if(column.bottom > 0) { column.bottom = 0; column.top = viewHeight - column.height; }
	}
		
	function trigger(column, movement) {
		column.element.trigger({
			type: 'reposition',
			by: -movement,
			above: -column.top,
			range: viewHeight,
			below: -column.bottom,
			height: column.height
		});
	}
	
	function write() {
		columns.forEach(writeColumn);
	}
	
	function setup() {
		console.log('setting up');
		$body.css({height: 3*viewHeight});
		$window.scrollTop(viewHeight);
	}

	function writeColumn(column) {
	//	if(column.element.attr('id') == 'body') console.log('Write', column.top, column.bottom, column.anchorBottom);
		column.element.css(
			column.anchorBottom? {top: 'auto', bottom: column.bottom}: {top: column.top, bottom: 'auto'}
		);
	}
	
	function scroll(movement) {
		read();
		moveView(movement);
		write();
	}
	
	(function () {
		var ignore = false;
		$window.on('scroll', function() {
			if(ignore) { ignore = false; return; }
			scroll(50*($window.scrollTop() - viewHeight));
			ignore = true;
			$window.scrollTop(viewHeight);
		});
	}());
	
//	$window.on('wheel', function(e) {
//		var y;
//		e = e.originalEvent;
//		if(e.deltaMode === 0) y = e.deltaY;
//		else if(e.deltaMode === 1) y = e.deltaY * lineHeight;
//		else if(e.deltaMode === 2) y = e.deltaY * viewHeight;
//		
//		if(y) scroll(y);
//	});
//	
//	$window.on('keydown', function(e) {
//		if(e.which == 38) scroll(-3*lineHeight);
//		else if(e.which == 40) scroll(3*lineHeight);
//		else if(e.which == 33) scroll(-viewHeight);
//		else if(e.which == 34) scroll(viewHeight);
//	});
//	
//	/* Handle Touch Events */
//	(function() {
//		
//		var ongoing, lastY;
//		
//		$window.on('touchstart', function(e) {
//			if(ongoing) return;
//			ongoing = true;
//			lastY = e.originalEvent.changedTouches[0].screenY;
//			e.preventDefault();
//		});
//		$window.on('touchend', function(e) {
//			if(!ongoing) return;
//			var currY = e.originalEvent.changedTouches[0].screenY;
//			scroll(lastY - currY);
//			ongoing = false;
//			e.preventDefault();
//		});
//		$window.on('touchcancel', function(e) { 
//			ongoing = false;
//		});
//		$window.on('touchmove', function(e) {
//			if(!ongoing) return;
//			var currY = e.originalEvent.changedTouches[0].screenY;
//			scroll(lastY - currY);
//			lastY = currY;
//			e.preventDefault();
//		});
//	}());

	$window.resize(function() { setup(); scroll(0); });
	
	$.fn.nudgeInView = function(movement) {
		read();
		moveColumn($(this).data('column'), movement);
		write();
	};
	
	$.fn.anchorBottom = function() {
		var column = $(this).data('column');
		readColumn(column);
		column.anchorBottom = true;
		writeColumn(column);
	};
	
	$.fn.anchorTop = function() {
		var column = $(this).data('column');
		readColumn(column);
		column.anchorBottom = false;
		writeColumn(column);
	};

}(jQuery));
