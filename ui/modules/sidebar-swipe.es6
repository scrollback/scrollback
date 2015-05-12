/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const prefixes = [ "webkit", "Moz", "ms", "O" ];

	let posX, elemWidth, bodyWidth,
		sidebar, overlay,
		diff;

	function translate(elem, amount) {
		if (elem && elem.nodeType) {
			window.requestAnimationFrame(() => {
				let value = amount ? "translate3d(" + amount + "px, 0, 0)" : "";

				for (let p of prefixes) {
					elem.style[p + "Transform"] = value;
				}

				elem.style.transform = value;
			});
		}
	}

	function opacity(elem, amount) {
		if (elem && elem.nodeType) {
			window.requestAnimationFrame(() => elem.style.opacity = amount);
		}
	}

	function onstart(e) {
		sidebar = sidebar || document.querySelector(".sidebar-right");

		if (sidebar && sidebar.contains(e.target)) {
			sidebar = document.querySelector(".sidebar-right");
			overlay = document.querySelector(".sidebar-overlay");

			elemWidth = sidebar.clientWidth;
			bodyWidth = document.body.clientWidth;

			if (e.target.className.indexOf("touch-target") && posX < 20) {
				translate(sidebar, -20);
				opacity(overlay, 20 / elemWidth);
			}
		}
	}

	function onend(e) {
		if (sidebar && sidebar.contains(e.target)) {
			if (posX > elemWidth / 2 && diff > 0) {
				core.emit("setstate", {
					nav: { view: "sidebar-right" }
				});
			} else if (diff < 0) {
				core.emit("setstate", {
					nav: { view: null }
				});
			}
		}

		posX = sidebar.clientWidth;
	}

	function onmove(e) {
		if (sidebar && sidebar.contains(e.target)) {
			let currPosX = bodyWidth - e.touches[0].pageX;

			diff = currPosX - posX;

			if (Math.abs(diff) > 2 && currPosX < elemWidth) {
				translate(sidebar, (currPosX * -1));
				opacity(overlay, currPosX / elemWidth);
			}

			posX = currPosX;

			e.preventDefault();
		}
	}

	document.addEventListener("touchstart", onstart, false);
	document.addEventListener("touchend", onend, false);
	document.addEventListener("touchcancel", onend, false);
	document.addEventListener("touchleave", onend, false);
	document.addEventListener("touchmove", onmove, false);

	core.on("statechange", changes => {
		if (changes.nav && "view" in changes.nav) {
			let view = store.get("nav", "view");

			if (view === "sidebar-right") {
				posX = sidebar.clientWidth;

				translate(sidebar, (posX * -1));
				opacity(overlay, 1);
			} else {
				posX = 0;

				translate(sidebar, null);
				opacity(overlay, null);
			}
		}

	}, 1);
};
