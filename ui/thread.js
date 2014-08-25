/* jshint browser: true */
/* global $, format */

var threadEl = {};

$(function() {
	var $template = $(".thread-item-container .thread-item").eq(0);

	threadEl.render = function ($el, thread, index) {
		var title = thread.title || "";
        $el = $el || $template.clone(false);
        if(thread.type == "missing") {
            $el.addClass("thread-item-missing");
            $el.attr("data-index", index);
			$el.text("missing threads");
        }else{
            $el.find(".thread-title").text(title.replace(/-/g, " ").trim());
            $el.find(".thread-snippet").html("");
            $el.find(".timestamp").html(format.friendlyTime(thread.startTime, new Date().getTime()));
            $el.attr("id", "thread-" + thread.id);
            $el.attr("data-index", index);
            $el.addClass("conv-" + thread.id.substr(-1));

            if (thread.id === window.currentState.thread) {
                $el.addClass("current");
            }

        }
		
		return $el;
	};
});

module.exports = threadEl;
