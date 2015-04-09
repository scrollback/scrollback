/* jshint browser: true */

var colors = [],
	currentColor;

function setStatusBarColor(color) {
	if (color !== currentColor && typeof window.Android.setStatusBarColor === "function") {
		if (color && typeof color === "string") {
			window.Android.setStatusBarColor(color);
		} else {
			window.Android.setStatusBarColor();
		}
	}

	currentColor = color;
}

document.addEventListener("readystatechange", function() {
	var testDiv, color, rgb;

	// Get thread colors
	if (document.readyState === "complete") {
		testDiv = document.createElement("div");

		document.body.appendChild(testDiv);

		for (var i = 0; i < 9; i++) {
			testDiv.className = "test-thread-color-dark-" + i;

			color = getComputedStyle(testDiv).backgroundColor;

			if (typeof color === "string" && /^(rgb)/.test(color)) {
				rgb = color.match(/\d+/g);

				colors.push("#" + parseInt(rgb[0]).toString(16) + parseInt(rgb[1]).toString(16) + parseInt(rgb[2]).toString(16));
			}

		}

		document.body.removeChild(testDiv);
	}
}, false);

module.exports = function(core, config, store) {
	core.on("setstate", function(changes, next) {
		var future = store.with(changes),
			env = future.get("context", "env"),
			mode, thread, index, color;

		if (env === "android") {
			mode = future.get("nav", "mode");

			if (mode === "chat") {
				thread = future.get("indexes", "threadsById", future.get("nav", "thread"));

				if (thread) {
					index = parseInt(thread.color);

					if (!isNaN(index)) {
						color = colors[index];
					}
				}
			}

			setStatusBarColor(color);
		}

		next();
	}, 100);
};
