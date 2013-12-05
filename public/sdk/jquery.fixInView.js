jQuery.fn.fixInView = function() {
	var lastTop = 0,
		columns = this,
		$ = jQuery;
		
	function reposition() {
		var top = $(window).scrollTop(),
			height = $(window).height(),
			up = lastTop > top;
		
		if(lastTop == top) return;
			
		columns.each(function () {
			var column = $(this),
				cHeight = column.outerHeight(),
				cTop = column.offset().top,
				small = cHeight < height;
			
			if(
				(!small && up || small && !up) && 
				column.data('fixedInView') == 'bottom'
			) {
				column.data('fixedInView', 'none');
				column.css({
					position: 'absolute',
					top: lastTop + height - cHeight,
					bottom: 'auto'
				});
			}
			
			else if(
				(!small && !up || small && up) && 
				column.data('fixedInView') == 'top'
			) {
				column.data('fixedInView', 'none');
				column.css({
					position: 'absolute',
					top: lastTop,
					bottom: 'auto'
				});
			}
			
			else if(
				(!small && up && cTop > top) ||
				(small && !up && cTop < top)
			) {
				column.data('fixedInView', 'top');
				column.css({
					position: 'fixed',
					top: 0,
					bottom: 'auto'
				});
			}
			
			else if(
				(!small && !up && cTop + cHeight < top + height) ||
				(small && up && cTop + cHeight > top + height)
			) {
				column.data('fixedInView', 'bottom');
				column.css({
					position: 'fixed',
					top: 'auto',
					bottom: 0
				});
			};
		});
		
		lastTop = top;
	}
	
	$(window).scroll(reposition);
	$(window).resize(function() {
		lastTop = $(window).scrollTop() + 1;
		reposition();
		lastTop = $(window).scrollTop() - 1;
		reposition();					
	});
};