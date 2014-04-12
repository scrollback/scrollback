/* jshint browser: true */
/* global $ */

var $template = $(".chat").eq(0);

function formatMessage(str) {
	return str.replace('<', '&lt;').replace('>', '&gt;'); // prevent script injection
	
	// TODO: linkification
}

function renderChat(el, msg) {
	el = el || $template.clone(false);
	
	el.find('.nick').text(msg.from);
	el.find('.message').html(formatMessage(msg.text) + new Date(msg.time).toString());
	el.data('index', msg.time);

	// TODO: add timestamps, add the 'timestamp-displayed' class, add the 'long' class.
	// TODO: add thread class (for dot color);
	
	return el;
}

$(function() {
	// Expand long messages
	$(".long").on("click", function() {
        $(this).toggleClass("active").scrollTop(0);
    });
});
