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
				column = { element: el, bottom: false };
			columns.push(column);
			el.css({position: 'fixed'});
			el.data("column", column);
		});
	};
	
	function read() {
		viewHeight = $window.height();
		
		columns.forEach(function (column) {
			column.top = column.element.offset().top;
			column.height = column.element.outerHeight();
		});
	}
	
	function moveView(movement) {
		columns.forEach(function (column) {
			var t = column.top;
			moveColumn(column, -movement);
			if(column.top != t) trigger(column, column.top - t);
		});
	}
	
	function moveColumn(column, movement) {
		if(column.small) {
			column.top = 0;
			return;
		}
		column.top = column.top + movement;
		if(column.top > 0) { column.top = 0; }
		if(column.top + column.height < viewHeight) {
			column.top = viewHeight - column.height;
		}
	}
		
	function trigger(column, movement) {
		// console.log('trigger', column.element.attr('id'), -column.top);
		column.element.trigger({
			type: 'reposition',
			by: -movement,
			above: -column.top,
			range: viewHeight,
			below: column.top + column.height - (viewHeight),
			height: column.height
		});
	}
	
	function write() {
		columns.forEach(function (column) {
			column.element.css(column.bottom?
				{top: column.top, bottom: 'auto'}:
				{top: 'auto', bottom: viewHeight - column.top - column.height}
			);
		});
	}
	
	function scroll(movement) {
		read();
		moveView(movement);
		write();
	}
	
	$(window).on('wheel', function(e) {
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
	
	$(window).resize(function() { scroll(0); });
	
	$.fn.nudgeInView = function(movement) {
		read();
		moveColumn($(this).data('column'), movement);
		write();
	};
	
	$.fn.anchorBottom = function() {
		console.log(this.attr('id'), 'set to bottom');
		$(this).data('column').bottom = true;
	};
	
	$.fn.anchorTop = function() {
		console.log(this.attr('id'), 'set to bottom');
		$(this).data('column').bottom = false;
	};

}(jQuery));