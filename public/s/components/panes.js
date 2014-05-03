/* jshint browser: true */
/* global $, libsb */

$(function() {
	$(document).on("click", '.tab',function() {
		var tab = $(this).attr("class").match(/\btab-([a-z\-]+)\b/);
		if(!tab) return;
		tab = tab[1]; // match returns an array with the capture groups starting at index 1.
		if((/-settings$/).test(tab)){
			var pane = '.pane-' + tab;
			$('.pane.current').removeClass('current');
			$(pane).addClass('current');
			// libsb.emit('navigate', {tab: tab});
		} else{
			libsb.emit('navigate', { tab: tab, source: "tabs"});
		}
	});
});
