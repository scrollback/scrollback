/* jshint browser: true */
/* global $ */

var $template = $(".chat").eq(0);

function formatMessage(str) {
	return str.replace('<', '&lt;').replace('>', '&gt;'); // prevent script injection
	
	// TODO: linkification
}

function renderChat(el, msg) {
	el = el || $tempalte.clone(false);
	
	el.find('.nick').text(msg.from);
	el.find('.message').html(formatMessage(msg.text));
	
	return el;
}

$(function() {
	// Expand long messages
	$(".long").on("click", function() {
        $(this).toggleClass("active").scrollTop(0);
    });
});
