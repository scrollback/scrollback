/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

// Handle PopOvers
$(document).on("click", ".has-popover", function() {
	var popover = $(".popover-body"),
		spacetop = $(this).offset().top - $(document).scrollTop() + $(this).height(),
		spacebottom = $(window).height() - spacetop + ( $(this).height() * 2 ) - popover.outerHeight(),
		spaceleft = $(this).offset().left - $(document).scrollLeft() + ( $(this).width() / 2 ) - ( popover.outerWidth() / 2 ),
		spaceright = $(window).width() - spaceleft - popover.outerWidth();

	if (spaceleft <= 0) {
		$(popover).addClass("arrow-left");
		spaceleft = $(this).width() / 2;
	} else if (spaceright <= 0) {
		$(popover).addClass("arrow-right");
		spaceleft = $(window).width() - ( $(this).width() / 2 ) - popover.outerWidth();
	}

	if (spacebottom > popover.outerHeight() ) {
		$(popover).addClass("popover-bottom");
	} else {
		$(popover).addClass("popover-top");
		spacetop = spacetop - $(this).height() - popover.outerHeight();
	}

	// Show and hide PopOver
	$(popover).css({"top" : spacetop, "left" : spaceleft});
	$("body").addClass("popover-active").append("<div class='layer'></div>");
	$(".layer").on("click", function() {
		$("body").removeClass("popover-active");
		$(popover).removeClass("popover-bottom").removeClass("popover-top").removeClass("arrow-left").removeClass("arrow-right");
		$(this).remove();
	});
});
