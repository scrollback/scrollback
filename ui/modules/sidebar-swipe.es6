/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const prefixes = [ "webkit", "Moz", "ms", "O" ];

	let [ x1, x2, y1, y2 ] = [ 0, 0, 0, 0 ],
		elemWidth = 0,
		sidebar, overlay;

	function translate(elem, amount) {
		if (elem && elem.nodeType) {
			if (typeof amount === "undefined") {
				let t = elem.style.transform;

				return t ? parseInt(t.replace(/^translate3d\(/, "").split(",")[0], 10) : 0;
			}

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
			if (typeof amount === "undefined") {
				return elem.style.opacity;
			}

			window.requestAnimationFrame(() => elem.style.opacity = amount);
		}
	}

	function onstart(e) {
		sidebar = sidebar || document.querySelector(".sidebar-right");

		if (sidebar && sidebar.contains(e.target)) {
			sidebar = document.querySelector(".sidebar-right");
			overlay = document.querySelector(".sidebar-overlay");

			elemWidth = sidebar.clientWidth;

			x1 = e.touches[0].pageX;
			y1 = e.touches[0].pageY;

			if (e.target.className.indexOf("touch-target") && translate(sidebar) > -20) {
				translate(sidebar, -20);
				opacity(overlay, 20 / elemWidth);

				e.preventDefault();
			}
		}

	}

	function onmove(e) {
		if (sidebar && sidebar.contains(e.target)) {
			let posX = e.touches[0].pageX,
				posY = e.touches[0].pageY;

			if (x2 !== posX) {
				if (x2) {
					if ((x2 < x1 && posX < x2) || (x2 > x1 && posX > x2)) {
						x2 = posX;
					} else {
						x1 = x2;
						x2 = posX;
					}
				} else {
					x2 = posX;
				}
			}

			if (y2 !== posY) {
				if (y2) {
					if ((y2 < y1 && posY < y2) || (y2 > y1 && posY > y2)) {
						y2 = posY;
					} else {
						y1 = y2;
						y2 = posY;
					}
				} else {
					y2 = posY;
				}
			}

			if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
				let t = translate(sidebar) - (x1 - x2);

				if (t > elemWidth * -1 && t < 0) {
					translate(sidebar, t);
					opacity(overlay, t * -1 / elemWidth);

					e.preventDefault();
				}
			}
		}
	}

	function onend(e) {
		if (sidebar && sidebar.contains(e.target)) {
			let t = translate(sidebar) * -1,
				w = elemWidth / 2;

			if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
				if (x1 > x2 && t > w) {
					core.emit("setstate", {
						nav: { view: "sidebar-right" }
					});
				} else if (x1 < x2 || t < w) {
					core.emit("setstate", {
						nav: { view: null }
					});
				}
			}

			x1 = x2 = y1 = y2 = 0;
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
				translate(sidebar, elemWidth * -1);
				opacity(overlay, 1);
			} else {
				translate(sidebar, null);
				opacity(overlay, null);
			}
		}

	}, 1);
};
