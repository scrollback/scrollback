/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const prefixes = [ "webkit", "Moz", "ms", "O" ];

	let posX, elemWidth, bodyWidth,
		sidebar, overlay;

	function translate(elem, amount) {
		if (elem && elem.nodeType) {
			let value = amount ? "translate3d(" + amount + "px, 0, 0)" : "";

			for (let p of prefixes) {
				elem.style[p + "Transform"] = value;
			}

			elem.style.transform = value;
		}
	}

	function opacity(elem, amount) {
		if (elem && elem.nodeType) {
			elem.style.opacity = amount;
		}
	}

	function onstart(e) {
		sidebar = sidebar || document.querySelector(".sidebar-right");

		if (sidebar && sidebar.contains(e.target)) {
			document.body.classList.add("swipe-start");

			sidebar = document.querySelector(".sidebar-right");
			overlay = document.querySelector(".sidebar-overlay");

			elemWidth = sidebar.clientWidth;
			bodyWidth = document.body.clientWidth;
		}
	}

	function onend(e) {
		if (sidebar && sidebar.contains(e.target)) {
			document.body.classList.remove("swipe-start");

			if (posX > elemWidth / 2) {
				core.emit("setstate", {
					nav: { view: "sidebar-right" }
				});
			} else {
				core.emit("setstate", {
					nav: { view: null }
				});
			}
		}

		posX = 0;
	}

	function onmove(e) {
		if (sidebar && sidebar.contains(e.target)) {
			let currPosX = bodyWidth - e.touches[0].pageX;

			if (currPosX !== posX && currPosX < elemWidth) {
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
	document.addEventListener("touchmove", onmove, false);

	core.on("statechange", changes => {
		if (changes.nav && "view" in changes.nav) {
			let view = store.get("nav", "view");

			if (view === "sidebar-right") {
				translate(sidebar, (sidebar.clientWidth * -1));
				opacity(overlay, 1);
			} else {
				translate(sidebar, null);
				opacity(overlay, null);
			}
		}

	}, 1);
};
