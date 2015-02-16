/* jshint browser: true */
/* global $ */

module.exports = function(core) {
	$(".js-sidebar-close").on("click", function() {
	    core.emit("setstate", { nav: { view: null }});
	});

	$(".js-goto-home").on("click", function() {
	    core.emit("setstate", {
	        nav: {
	            mode: "home",
	            view: null
	        }
	    });
	});
};
