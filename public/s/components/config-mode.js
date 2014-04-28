/* jshint browser: true */
/* global $, libsb */

$(function() {
	$(".configure-button").on("click", function() {
        libsb.emit('navigate', { mode: "conf", tab: "general-settings", source: "configure-button" });
	});

	$(".conf-save").on("click", function() {
        libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-save" });
	});

	$(".conf-cancel").on("click", function() {
        libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-cancel" });
	});
});
