(function($) {
	
	var ignoreScroll = false;
	var lastTop = 0;
	
	$.fn.fixInView = function(container) {
		var columns = this;
	
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
					cTop = column.position().top,
					small = cHeight < height,
					status = column.data('fixedInStatus'),
					cSilent = !!silent,
					dbg = [column.attr('id'), status, top, height, cTop, cHeight, small].join(' ');
				
				if(status == 'top' || status == 'bottom') {
					cTop += top;
				}
				
				console.log(column.attr('id'), status, top, height, cTop, cHeight, small);
				
				if((!small && up || small && !up) && status == 'bottom') {
					// console.log(dbg, 'unfixing up');
					column.data('fixedInStatus', 'none');
					status = 'none';
					column.css({
						position: 'absolute',
						top: lastTop + height - cHeight,
						bottom: 'auto'
					});
				}
				
				if((!small && !up || small && up) && status == 'top') {
					// console.log(dbg, 'unfixing dn');
					column.data('fixedInStatus', 'none');
					status = 'none';
					column.css({
						position: 'absolute',
						top: lastTop,
						bottom: 'auto'
					});
				}
								
				if(
					status != 'top' &&
					((!small && up && cTop > top) ||
					(small && !up && cTop < top))
				) {
					// console.log(dbg, 'fixing up');
					column.data('fixedInStatus', 'top');
					column.css({
						position: 'fixed',
						top: 0,
						bottom: 'auto'
					});
				}
				
				if(
					status != 'bottom' &&
					((!small && !up && cTop + cHeight < top + height) ||
					(small && up && cTop + cHeight > top + height))
				) {
					// console.log(dbg, 'fixing dn');
					column.data('fixedInStatus', 'bottom');
					column.css({
						position: 'fixed',
						top: 'auto',
						bottom: 0
					});
				}
				
				if(!cSilent) {
					status = column.data('fixedInStatus');
					cTop = column.offset().top + ((status == 'top' || status == 'bottom')? top: 0);
					
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
			
			lastTop = container.scrollTop();
		}
		
		container.scroll(function(e) {
			if(ignoreScroll) return;
			reposition(e, false);
		});
		$(window).resize(function(e) {
			lastTop = container.scrollTop() + 1;
			reposition(e, true);
			lastTop = container.scrollTop() - 1;
			reposition(e, true);
		});
	};
	
	$.fn.nudgeInView = function (adjustment, readjustment) {
		var container = this.data('fixedInContainer'),
			column = this;
		
		if(adjustment === 0) return;
		
		if(!readjustment) {
			ignoreScroll = true;
			// console.log('nudge', column.attr('id'), adjustment);
			// console.log("set ignore"); 
		}
		
		if(!container) {
			// console.log('Cannot nudgeInView: Isnt fixedInView yet', this);
			return;
		}
		
		var top = container.scrollTop(),
			height = container.height(),
			cHeight = column.outerHeight(),
			cTop = column.offset().top,
			small = cHeight < height,
			up = adjustment < 0;
			dbg = [column.attr('id'), top, height, cTop, cHeight, column.offsetParent()[0]].join(' ');
		
		if(column.data('fixedInStatus') != 'none') {
			column.data('fixedInStatus', 'none');
			column.css({
				position: 'absolute',
				top: cTop,
				bottom: 'auto'
			});
		}
		
		column.css({top: cTop + adjustment});
		if(cTop + adjustment < 0 && !readjustment) {
			adjustment = -cTop - adjustment;
			container.data('fixedInColumns').each(function() {
				$(this).nudgeInView(adjustment, true);
			});
			container.scrollTop(container.scrollTop() + adjustment);
			lastTop = container.scrollTop();
		}
		
		
		
		cTop = column.offset().top;
		top = container.scrollTop();
		
		if(
			((!small && cTop > top) ||
			(small && cTop < top))
		) {
			// console.log(dbg, 'refixing up');
			column.data('fixedInStatus', 'top');
			column.css({
				position: 'fixed',
				top: 0,
				bottom: 'auto'
			});
		}
		
		else if(
			((!small && cTop + cHeight < top + height) ||
			(small && cTop + cHeight > top + height))
		) {
			// console.log(dbg, 'refixing dn');
			column.data('fixedInStatus', 'bottom');
			column.css({
				position: 'fixed',
				top: 'auto',
				bottom: 0
			});
		}
		
		if(!readjustment) setTimeout(function() {
			ignoreScroll = false; 
			// console.log("clear ignore");
		}, 100);
	};
}(jQuery));