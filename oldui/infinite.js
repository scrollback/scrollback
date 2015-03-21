/*jslint browser: true, indent: 4, regexp: true*/
/*global jQuery*/

(function($) {
	/* $container.infinite(options) will set up infinite scrolling in the container. */
	$.fn.infinite = function(options) {
		var scrollSpace = options.scrollSpace || 1000,
			fillSpace = options.fillSpace || 200,
			itemHeight = options.itemHeight || 20,
			maxReq = options.maxReq || 32,
			startIndex = options.startIndex,
			getItems = options.getItems;

		if (typeof getItems !== 'function') console.error("Infinite scroll requires a getItems callback.");

		$(this).data("options", options);
		$(this).empty();
		$(this).each(function() {
			var $logs = $(this),
				$above = $("<div>").addClass("infinite-above").appendTo($logs),
				$items = $("<div>").addClass("infinite-items").appendTo($logs),
				$below = $("<div>").addClass("infinite-below").appendTo($logs),
				pendingRequests = {};

			var timer = null,
				viewTop, viewHeight, scrollHeight,
				atTop = false,
				atBottom = false;

			function read() {
				viewTop = $logs.scrollTop();
				viewHeight = $logs.height();
				atTop = $logs.data("upper-limit");
				atBottom = $logs.data("lower-limit");
				scrollHeight = $logs.prop('scrollHeight');
				startIndex = $logs.data('index');
			}

			// Extend and contract the empty space as needed when scrolling.
			function updateSpaces() {
				var belowHeight, aboveHeight;

				aboveHeight = atTop ? 0 : Math.max(scrollSpace, $above.height() + scrollSpace - viewTop);
				if (aboveHeight != $above.height()) {
					viewTop += aboveHeight - $above.height();
					$above.height(aboveHeight);
					$logs.scrollTop(viewTop);
				}

				belowHeight = atBottom ? 0 : Math.max(scrollSpace, $below.height() + scrollSpace + viewHeight + viewTop - scrollHeight);
				if (belowHeight != $below.height()) $below.height(belowHeight);
			}

			function getGridColumns() {
				var items = $items.children(),
					initLeft, i, l;
				if (items.length === 0) return 1;

				initLeft = items.eq(0).offset().left;
				for (i = 1, l = items.size(); i < l && items.eq(i).offset().left != initLeft; i++);
				return i < l ? i : 1;
			}

			function updateItems() {
				var itemsTop = viewTop + $items.offset().top - $logs.offset().top,
					fillAbove = viewTop - itemsTop,
					cols,
					fillBelow = (itemsTop + $items.height()) - (viewTop + viewHeight),
					recycle = [],
					number;

				//				if (debug) console.log("updateItems", viewTop, fillAbove, fillBelow, atTop, atBottom);

				if (fillAbove > fillSpace) {
					recycle = recycle.concat(remove(fillAbove - fillSpace, "above"));
				}

				if (fillBelow > fillSpace) {
					recycle = recycle.concat(remove(fillBelow - fillSpace, "below"));
				}
				if (fillAbove < fillSpace && !pendingRequests.above && !atTop) {
					pendingRequests.above = true;
					cols = getGridColumns();
					number = Math.min(maxReq, Math.ceil((fillSpace - fillAbove) / itemHeight / cols) * cols);
					getItems(
						$items.children().eq(0).data("index") || startIndex,
						number, 0, recycle,
						function(its) {
							pendingRequests.above = false;
							render(its, "above");
						}
					);
				}

				if (fillBelow < fillSpace && !pendingRequests.below && !atBottom) {
					pendingRequests.below = true;
					cols = getGridColumns();
					getItems(
						$items.children().eq(-1).data("index") || startIndex,
						0, Math.min(maxReq, Math.ceil((fillSpace - fillBelow) / itemHeight / cols) * cols),
						recycle,
						function(its) {
							pendingRequests.below = false;
							render(its, "below");
						}
					);
				}
			}

			function render(els, where) {
				var oldTerm, height = 0;

				if (els[0] === false && where == "above") {
					atTop = true;
					$logs.data("upper-limit", true).children(".infinite-above").addClass("upper-limit");
					els.shift();
				}
				if (els[els.length - 1] === false && where == "below") {
					atBottom = true;
					$logs.data("lower-limit", true).children(".infinite-below").addClass("lower-limit");
					els.pop();
				}

				if (els.length === 0) return;

				// Remove repeated elements
				if (where == "above" && $items.children().eq(0).data("index") === els[els.length - 1].data("index")) {
					els.pop();
				} else if (where == "below" && $items.children().eq(-1).data("index") === els[0].data("index")) {
					els.shift();
				}

				if (els.length === 0) return;
				// Add elements to the DOM before measuring height.
				if (where == "above") {
					oldTerm = $items.children().eq(0);
					$items.prepend(els);

					// does it ever become null? undocumented jquery behavior?
					//					if (oldTerm === null) return update();

					if (oldTerm.size()) {
						height = oldTerm.offset().top - els[0].offset().top;
					} else {
						height = $items.height();
					}
					if ($above.height() > height) {
						$above.height($above.height() - height);
					} else {
						$above.height(0);
					}

				} else {
					oldTerm = $items.children().eq(-1);
					$items.append(els);
					if (oldTerm.size()) {
						height = (els[els.length - 1].offset().top + els[els.length - 1].height()) -
							(oldTerm.offset().top + oldTerm.height());
					} else {
						height = $items.height();
					}
					$below.height(Math.max(0, $below.height() - height));
				}

				itemHeight = ($items.height() / $items.children().size()) || 1; // dont change if it would become zero.

				//				if (debug) console.log("added " + els.length + " " + where + " with height ", height, "; " + $items.children().size() + " items.");
				update();
			}

			function remove(pixels, where) {
				var itemsToRemove = [],
					height = 0,
					els = $items.children(),
					i, l, oldTerm;

				function checkAndRemove(el) {
					var h;

					if (where == 'above') {
						h = -oldTerm.offset().top + el.offset().top + el.outerHeight();
					} else {
						h = -(el.offset().top) + (oldTerm.offset().top + oldTerm.outerHeight());
					}

					if (h > pixels) return true;
					itemsToRemove.push(el[0]);
					height = h;
					return false;
				}

				/* We don't remove the last one, even if it's way outside. */

				if (where == "above") {
					oldTerm = $items.children().eq(0);
					atTop = false;
					$logs.data("upper-limit", false).children(".infinite-above").removeClass("upper-limit");
					for (i = 0, l = els.size() - 1; i < l; i++)
						if (checkAndRemove(els.eq(i))) break;
				} else {
					oldTerm = $items.children().eq(-1);
					atBottom = false;
					$logs.data("lower-limit", false).children(".infinite-below").removeClass("lower-limit");
					for (i = els.size() - 1; i > 0; i--)
						if (checkAndRemove(els.eq(i))) break;
				}

				if (itemsToRemove.length === 0) return [];

				if (where == "above") $above.height($above.height() + height);
				else $below.height($below.height() + height);

				$(itemsToRemove).remove();
				return itemsToRemove;
			}

			function update() {
				if (!$logs.is(':visible')) return;
				read();
				updateSpaces();
				updateItems();
			}

			$logs.data("update-infinite", update);

			$logs.scroll(function() {
				if (timer) clearTimeout(timer);
				timer = setTimeout(update, 200);
			});

			$(window).resize(update);

			read();
			$logs.scrollTop((scrollHeight - viewHeight) / 2);
		});
	}; /* end $.fn.infinite */

	$.fn.reset = function(index) {
		var $logs = $(this);
		//		var	options = $logs.data("options");

		$logs.find(".infinite-items").empty();
		$logs.data("lower-limit", false).children(".infinite-above").removeClass("upper-limit").height("inherit");
		$logs.data("upper-limit", false).children(".infinite-below").removeClass("lower-limit").height("inherit");

		// try '', null instead of inherit, final option is options.scrollSpace;

		if (typeof index !== undefined) $logs.data("index", index);
		$logs.scrollTop(($logs.prop('scrollHeight') - $logs.height()) / 2);
		$logs.data("update-infinite")();
	};

	$.fn.addBelow = function(el) {
		var $logs = $(this),
			atBottom = $logs.data("lower-limit") && $logs.scrollTop() - $logs[0].scrollHeight + $logs.height() === 0;

		$logs.find(".infinite-items").append(el);
		if (atBottom) $logs.scrollTop($logs[0].scrollHeight);
		$logs.data("update-infinite")();
	};

	$.fn.addAbove = function(el) {
		var $logs = $(this);
		$logs.find(".infinite-items").prepend(el);
		$logs.data("update-infinite")();
	};

}(jQuery));
