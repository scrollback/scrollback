jQuery.fn.fixInView = function(container) {
	var lastTop = 0,
		columns = this,
		$ = jQuery;

	container = container || $(window);
	
	container.data('fixedInColumns', columns);
	
	columns.each(function () {
		$(this).data('fixedInContainer', container);
	});
	
	function reposition(event, silent) {
		var top = container.scrollTop(),
			height = container.height(),
			up = lastTop > top;
		
		if(lastTop == top) return;
			
		columns.each(function () {
			var column = $(this),
				cHeight = column.outerHeight(),
				cTop = column.position().top + column.offsetParent().scrollTop(),
				small = cHeight < height,
				status = column.data('fixedInStatus'),
				cSilent = !!silent,
				dbg = [column.attr('id'), top, height, cTop, cHeight, column.offsetParent()[0]].join(' ');
			
			if((!small && up || small && !up) && status == 'bottom') {
				console.log(dbg, 'unfixing up');
				column.data('fixedInStatus', 'none');
				status = 'none';
				column.css({
					position: 'absolute',
					top: lastTop + height - cHeight,
					bottom: 'auto'
				});
			}
			
			else if((!small && !up || small && up) && status == 'top') {
				console.log(dbg, 'unfixing dn');
				column.data('fixedInStatus', 'none');
				status = 'none';
				column.css({
					position: 'absolute',
					top: lastTop,
					bottom: 'auto'
				});
			}
			
			if()
			
			if(
				status != 'top' &&
				((!small && up && cTop > top) ||
				(small && !up && cTop < top))
			) {
				console.log(dbg, 'fixing up');
				column.data('fixedInStatus', 'top');
				column.css({
					position: 'fixed',
					top: 0,
					bottom: 'auto'
				});
			}
			
			else if(
				status != 'bottom' &&
				((!small && !up && cTop + cHeight < top + height) ||
				(small && up && cTop + cHeight > top + height))
			) {
				console.log(dbg, 'fixing dn');
				column.data('fixedInStatus', 'bottom');
				column.css({
					position: 'fixed',
					top: 'auto',
					bottom: 0
				});
			}
			
			else if(!cSilent && (status == 'top' || status == 'bottom')) {
				cSilent = true;
			}
			
			if(!cSilent) {
				// cTop = column.offset().top;
				column.trigger({
					type: 'reposition',
					by: top - lastTop,
					above: -cTop + top,
					range: height, 
					below: cHeight - height + cTop - top,
					height: cHeight
				});
			}
		});
		
		lastTop = top;
	}
	
	container.scroll(reposition);
	$(window).resize(function(e) {
		lastTop = container.scrollTop() + 1;
		reposition(e, true);
		lastTop = container.scrollTop() - 1;
		reposition(e, true);
	});
};

jQuery.fn.nudgeInView = function (adjustment) {
	var container = this.data('fixedInContainer'),
		column = this;

	if(!container) {
		console.log('Cannot nudgeInView: Isnt fixedInView yet', this);
		return;
	}
	
	var top = container.scrollTop(),
		height = container.height(),
		cHeight = column.outerHeight(),
		cTop = column.offset().top,
		small = cHeight < height;
	
	if(column.data('fixedInStatus') != 'none') {
		column.data('fixedInStatus', 'none');
		column.css({
			position: 'absolute',
			top: cTop,
			bottom: 'auto'
		});
	}
	
	column.css({top: cTop + adjustment});
	if(cTop + adjustment < 0) {
		adjustment = -cTop - adjustment;
		container.data('fixedInColumns').each(function() {
			$(this).nudgeInView(adjustment);
		});
		container.scrollTop(container.scrollTop() + adjustment);
	};
};
