/*jslint browser: true, indent: 4, regexp: true*/
/*global $*/

// Fix firefox not showing caret in correct position
$(".segmented").on("click", function() {
	$(this).children().last().focus();
});

// Create a new segment
function addSegment(el, text) {
	if (!text.match(/^\s*$/) ) {
		$("<div class='segment done'>" + text + "<span class='rem-segment'>&times;</span></div>").insertBefore(el);
		el.empty();
	}
}

// Add a segment on space, comma or enter key
$(".segment").on("keydown", function(e) {
	if (e.keyCode === 13 || e.keyCode === 32 || e.keyCode === 188) {
		e.preventDefault();
		addSegment($(this), $(this).text());
	}
});

// Convert words to segments when text is pasted
$(".segment").on("paste", function(e) {
	e.preventDefault();

	var segments = e.originalEvent.clipboardData.getData('Text').split(/[\s,]+/);

	for (var i = 0; i < segments.length; i++) {
		addSegment($(this), segments[i]);
	}
});

// Remove a segment when close button clicked
$(document).on("click", ".rem-segment", function() {
	$(this).parent().remove();
	$(this).parent().parent().focus();
});

// Remove segment when backspace pressed
$(".segment").on("keydown", function(e) {
	if (e.keyCode === 8 && $(this).text().match(/^\s*$/)) {
		$(this).prev().remove();
	}
});
