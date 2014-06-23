/* jshint browser: true */
/* global $ */

/**
 * @fileOverview Set cursor to end in contenteditable div.
 * @author Satyajit Sahoo <satya@scrollback.io>
 * @requires jQuery
 */

$.fn.setCursorEnd = function() {
	var range, selection;

	if (document.createRange) {
		range = document.createRange();
		range.selectNodeContents(this[0]);
		range.collapse(false);
		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	} else if (document.selection) {
		range = document.body.createTextRange();
		range.moveToElementText(this[0]);
		range.collapse(false);
		range.select();
	}

	return this;
};
