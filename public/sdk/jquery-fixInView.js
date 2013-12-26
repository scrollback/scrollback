(function($) {
	var columns = []
	, 	minh = 0
	,	$window = $(window)
	,	$body = $(document.body)
	,	bodyHeight
	,	viewHeight
	,	viewTop
//	, 	ignoreScroll = false
	;
	
	$.fn.fixInView = function() {
		this.each(function () {
			var el = $(this),
				column = { status: 'none', element: el };
			columns.push(column);
			el.data("column", column);
		});
	};
	
	function read() {
		bodyHeight = $body.height();
		viewHeight = $window.height();
		viewTop = $window.scrollTop();
		
		columns.forEach(function (column) {
			column.top = column.element.offset().top;
			// if(column.element.css('position') == 'fixed') column.top += viewTop;
			column.height = column.element.outerHeight();
			column.small = (column.height < viewHeight);
		});
	}
	
	function unfix(column, movement) {
		if(
			((!column.small && movement < 0 || column.small && movement > 0) &&
			column.status == 'bottom') ||
			((!column.small && movement > 0 || column.small && movement < 0) && 
			column.status == 'top')
		) {
			column.status = 'none';
			column.top -= movement;
			// console.log('unfix', column.element.attr('id'), column.top, movement, column.small);
		}
	}
	
	function fix(column, movement) {
		if(
			column.status != 'top' &&
			((!column.small && movement <= 0 && column.top > viewTop) ||
			(column.small && movement >= 0 && column.top < viewTop))
		) {
			column.status = 'top';
			column.top = viewTop;
			// console.log('fix top', column.element.attr('id'));
		}
		
		else if(
			column.status != 'bottom' &&
			((!column.small && movement >= 0 && column.top + column.height < viewTop + viewHeight) ||
			(column.small && movement <= 0 && column.top + column.height > viewTop + viewHeight))
		) {
			column.status = 'bottom';
			column.top = viewTop + viewHeight - column.height;
			// console.log('fix bottom', column.element.attr('id'));
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
		// console.log('movement', movement);
		columns.forEach(function(column) { moveColumn(column, movement); });
	}
	
	function moveColumn(column, movement) {
		column.top += movement;
	}
	
	function update(movement) {
		var top=Infinity, bottom=0;
		movement = movement || 0;
		columns.forEach(function (column) {
			var lastTop = column.top;
			unfix(column, movement);
			fix(column, movement);
			trigger(column, movement);
			if(column.top < top) top = column.top;
			if(column.top + column.height > bottom) bottom = column.top + column.height;
		});
		
		bodyHeight = bottom - top;
		moveView(-top);
	}
	
	function write() {
//		ignoreScroll = true;
		$body.height(bodyHeight);
		if(Math.abs($window.scrollTop() - viewTop) > 1) {
			// console.log('View jump', $window.scrollTop(), viewTop);
			$window.scrollTop(viewTop);
		}
		
		columns.forEach(function (column) {
			switch(column.status) {
				case 'top':
					column.element.css({position: 'fixed', top: 0, bottom: 'auto'});
					break;
				case 'bottom':
					column.element.css({position: 'fixed', bottom: 0, top: 'auto'});
					break;
				default:
					column.element.css({
						position: 'absolute',
						top: column.top,
						bottom: 'auto'
					});
			}
		});
//		ignoreScroll = false;
	}
	
	$window.scroll(function(e) {
//		if(ignoreScroll) { console.log('ignoring scroll event'); return; }
		var lastViewTop = viewTop;
		read();
		update(viewTop - lastViewTop);
/*		console.log(columns.map(function (c) {
			return [c.element.attr('id'), c.status, c.top, c.height].join(' ');
		}).join('; ') + '; ' + [viewTop, bodyHeight]); */
		write();
	});
	
	$(window).resize(function(e) {
		read();
		update();
		write();
	});
	
	$.fn.nudgeInView = function(adjustment) {
		var self = this;
		// console.log('nudge', adjustment, this);
		read();
		columns.forEach(function(column) {
			if(column.element[0] == self[0]) {
				column.status = 'none';
				column.top += adjustment;
			}
		});
		update(0);
		write();
	};

}(jQuery));