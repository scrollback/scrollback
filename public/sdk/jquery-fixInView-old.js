(function($) {
	/* jshint laxcomma: true */
	/* jshint browser: true */
	/* global jQuery */
	
	var columns = []
	,	$window = $(window)
	,	$body = $(document.body)
	,	bodyHeight
	,	viewHeight
	,	viewTop
	;
	
	$.fn.fixInView = function() {
		this.each(function () {
			var el = $(this),
				column = { anchor: 'top', float: true, element: el };
			columns.push(column);
			el.data("column", column);
		});
		setTimeout(function() {$window.trigger('resize');},0);
	};
	
	function read() {
		viewHeight = $window.height();
		viewTop = $window.scrollTop();
		columns.forEach(readColumn);
	}
	
	function readColumn(column) {
		column.top = column.element.offset().top;
		column.height = column.element.outerHeight();
		column.small = (column.height < viewHeight);
		console.log('reading', column.element.attr('id'), column.anchor, column.float?'absolute':'fixed', column.top);
	}
	
	function unfix(column, movement) {
		if(
			((!column.small && movement < 0 || column.small && movement > 0) &&
			column.anchor == 'bottom' && !column.float) ||
			((!column.small && movement > 0 || column.small && movement < 0) && 
			column.anchor == 'top' && !column.float)
		) {
			column.float = true;
			column.top -= movement;
		}
	}
	
	function fix(column, movement) {
		if(
			column.anchor != 'top' &&
			((!column.small && movement <= 0 && column.top > viewTop) ||
			(column.small && movement >= 0 && column.top < viewTop))
		) {
			column.anchor = 'top';
			column.float = false;
			column.top = viewTop;
			console.log('fix top', column.element.attr('id'));
		}
		
		else if(
			column.anchor != 'bottom' &&
			((!column.small && movement >= 0 && column.top + column.height < viewTop + viewHeight) ||
			(column.small && movement <= 0 && column.top + column.height > viewTop + viewHeight))
		) {
			column.anchor = 'bottom';
			column.float = false;
			column.top = viewTop + viewHeight - column.height;
			console.log('fix bottom', column.element.attr('id'));
		}
	}
	
	function trigger(column, movement) {
		column.element.trigger({
			type: 'reposition',
			by: movement,
			above: viewTop - column.top,
			range: viewHeight,
			below: column.top + column.height - (viewTop + viewHeight),
			height: column.height
		});
	}
	
	function moveView(movement) {
		viewTop += movement;
		columns.forEach(function(column) { moveColumn(column, movement); });
	}
	
	function moveColumn(column, movement) {
		column.top += movement;
	}
	
	function update(movement, silently) {
		movement = movement || 0;
		columns.forEach(function (column) {
			unfix(column, movement);
			fix(column, movement);
			if(!silently) trigger(column, movement);
		});
	}
	
	function write() {
		var top=Infinity, bottom=0;
		columns.forEach(function (column) {
			if(column.top < top) top = column.top;
			if(column.top + column.height > bottom) bottom = column.top + column.height;
		});
		
		bodyHeight = bottom - top;
		$body.height(bodyHeight);
		if(Math.abs($window.scrollTop() - viewTop) > 1) {
			$window.scrollTop(viewTop);
		}
		columns.forEach(writeColumn);
	}
	
	function writeColumn(column) {
		console.log('writing', column.element.attr('id'), column.anchor, column.float?'absolute':'fixed', column.top);
		if(column.float) {
			column.element.css(
				column.anchor == 'bottom'? 
				{position: 'absolute', top: 'auto', bottom: bodyHeight - (column.top + column.height)}:
				{position: 'absolute', top: column.top, bottom: 'auto'}
			);
		} else {
			column.element.css(
				column.anchor == 'bottom'? 
				{position: 'fixed', top: 'auto', bottom: 0}:
				{position: 'fixed', top: 0, bottom: 'auto'}
			);
		}
	}
	
	$window.scroll(function(e) {
		console.log(e.originalEvent.pageY);
		var lastViewTop = viewTop;
		read();
		update(viewTop - lastViewTop);
		write();
	});
	
	$window.resize(function() {
		console.log('resized');
		read();
		update();
		write();
	});
	
	$.fn.nudgeInView = function(adjustment) {
		var self = this;
		read();
		columns.forEach(function(column) {
			if(column.element[0] == self[0]) {
				column.float = true;
				column.top += adjustment;
			}
		});
		update(0, true);
		write();
	};
	
	$.fn.anchorBottom = function() {
		var column = $(this).data('column');
		read();
		column.anchor = "bottom";
		write();
	};
	
	$.fn.anchorTop = function() {
		var column = $(this).data('column');
		read();
		column.anchor = "top";
		write();
	};

}(jQuery));