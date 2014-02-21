(function($) {
	/* jshint laxcomma: true */
	/* jshint browser: true */
	/* global jQuery */
	
	var columns = []
	,	$window = $(window)
	,	$body = $(document.body)
	,	viewHeight
	;
	
	$.fn.fixInView = function() {
		this.each(function () {
			var el = $(this),
				column = { element: el, anchorBottom: false };
			columns.push(column);
			el.css({position: 'fixed'});
			el.data("column", column);
		});
	};
	
	function read() {
		viewHeight = $window.height();
		columns.forEach(readColumn);
	}

	function readColumn(column) {
		column.top = column.element.offset().top;
		column.height = column.element.outerHeight();
		column.bottom = viewHeight - (column.top + column.height);
	//	if(column.element.attr('id') == 'body') console.log('Read', column.top, column.bottom, column.anchorBottom);
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
	
	$window.on('wheel', function(e) {
		var y, lhs, lh;
		e = e.originalEvent;
		if(e.deltaMode === 0) y = e.deltaY;
		else if(e.deltaMode === 1) {
			lhs = $body.css('lineHeight');
			lh = parseFloat(lhs);
			if(lhs.substr(-2) != 'px') {
				lh = (isNaN(lh)? 1.5: lh) * parseFloat($body.css('fontSize'));
			}
			y = e.deltaY * lh;
		}
		else if(e.deltaMode === 2) y = e.deltaY * viewHeight;
		
		if(y) scroll(y);
	});
	
	$window.on('keydown', function(e) {
			var lhs = $body.css('lineHeight'),
				lh = parseFloat(lhs);
			if(lhs.substr(-2) != 'px') {
				lh = (isNaN(lh)? 1.5: lh) * parseFloat($body.css('fontSize'));
			}
		if(e.which == 38) scroll(-3*lh);
		else if(e.which == 40) scroll(3*lh);
		else if(e.which == 33) scroll(-viewHeight);
		else if(e.which == 34) scroll(viewHeight);
	});

	$window.resize(function() { scroll(0); });
	
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
