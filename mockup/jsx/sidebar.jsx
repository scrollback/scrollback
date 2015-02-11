/* jshint browser: true */
/* global $ */

module.exports = function(core) {
	$(".js-sidebar-left-open").on("click", function() {
	    core.emit("setstate", { nav: { view: "sidebar-left" }});
	});

	$(".js-sidebar-right-open").on("click", function() {
	    core.emit("setstate", { nav: { view: "sidebar-right" }});
	});

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
