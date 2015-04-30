/**
 * @fileOverview - jQuery plugin boilerplate.
 * @author - Satyajit Sahoo <satya@scrollback.io>
 * @requires - jQuery
 */

function registerPlugin(pluginName, defaults, methods) {
	"use strict";

	(function($, window, document, undefined) {

		function Plugin(element, options) {
			this.element = element;

			// Set plugin options
			this.settings = $.extend({}, defaults, options);

			// Provide access to the default options and plugin name
			this._defaults = defaults;
			this._name = pluginName;

			// Initialize only if called with an element
			if (element) {
				this.init();
			}
		}

		$.extend(Plugin.prototype, methods);

		$.fn[pluginName] = function(options) {
			var args = arguments,
				returns, instance;

			if (!this.length) {
				// No element exists, don't do anything
				return;
			}

			if (typeof options === "undefined" || typeof options === "object") {
				// Initialize the plugin and return the element
				return this.each(function() {
					if (!$.data(this, "plugin_" + pluginName)) {
						$.data(this, "plugin_" + pluginName, new Plugin(this, options));
					}
				});
			} else if (typeof options === "string" && options !== "init" && !(/^_/).test(options)) {
				// Trying to call a plugin method
				this.each(function() {
					instance = $.data(this, "plugin_" + pluginName);

					if (instance instanceof Plugin && typeof instance[options] === "function") {
						returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
					}

					if (options === "destroy") {
						$.data(this, "plugin_" + pluginName, null);
					}
				});

				return (typeof returns !== "undefined") ? returns : this;
			}
		};

		$[pluginName] = function(element, options) {
			var params = Array.prototype.slice.call(arguments, 1),
				$element;

			if (typeof element === "string" && typeof methods[element] === "function") {
				// Plugin is called with a method instead of an element
				return methods[element].apply(new Plugin(), params);
			} else {
				// Create an empty jQuery object if no element exists
				$element = element ? $(element) : $();

				$element[pluginName].apply($element, params);
			}
		};

	})(jQuery, window, document);
}

if (typeof define === "function" && define.amd) {
	// Define as AMD module
	define(function() {
		return registerPlugin;
	});
} else if (typeof module !== "undefined" && module.exports) {
	// Export to CommonJS
	module.exports = registerPlugin;
} else {
	window.registerPlugin = registerPlugin;
	window.require = function(file) {
		// Polyfill "require" function so that the plugins work in normal environment
		if (file === "./jquery.lace.js") {
			return registerPlugin;
		} else {
			return function() {};
		}
	};
}
