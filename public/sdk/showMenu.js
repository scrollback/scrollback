function showMenu(el, opt) {
	layer = $("<div>").addClass('layer').click(hide);
	menu = $("<div>").addClass('menu').addClass('clearfix');
	arrow = $("<div>").addClass('arrow').appendTo(menu);
	for(i in opt) {
		$("<button>").addClass('menuitem').text(i).click( {option: i}, function(event) {
			opt[event.data.option]();
			hide();
		}).appendTo(menu);
	}
	
	$(document.body).append(layer, menu, arrow);
	
	elt = el.offset().top - $(document.body).scrollTop(); // element top relative to window
	ell = el.offset().left - $(document.body).scrollLeft();
	elw = el.width();
	elh = el.height();
	
	scrw = $(window).width();
	scrh = $(window).height();
	
	menuw = menu.width();
	menuh = menu.height();
	
//	spaceAbove = elt - $(document.body).scrollTop;
	spaceBelow = scrh - elt - elh;
	
	if(spaceBelow > menuh) {
		arrow.addClass('up');
		menut = elt + elh;
	}
	else {
		arrow.addClass('down');
		menut = elt - menuh;
	}
	
	// default:
	
	menul = ell + (elw - menuw)/2;
	if(menul < 0) menul = 0;
	else if(menul > scrw - menuw) menul = scrw - menuw;
	
	arrow.css({left: ell + (elw - arrow.width())/2 - menul});
	
	menu.css({left: menul, top: menut});
	
	function hide() {
		$(".layer").remove();
		$(".menu").remove();
	}
	
}