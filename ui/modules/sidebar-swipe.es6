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
				console.log(translate(sidebar) - (x1 - x2), elemWidth * -1));

				let t = Math.min(Math.max(translate(sidebar) - (x1 - x2), elemWidth * -1), 0);

				translate(sidebar, t);
				opacity(overlay, t * -1 / elemWidth);

				e.preventDefault();
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

	//
	// function onend(e) {
	// 	if (sidebar && sidebar.contains(e.target) && (direction === LEFT || direction === RIGHT)) {
	// 		if (position < bodyWidth - (elemWidth / 2)) {
	// 			core.emit("setstate", {
	// 				nav: { view: "sidebar-right" }
	// 			});
	// 		} else {
	// 			core.emit("setstate", {
	// 				nav: { view: null }
	// 			});
	// 		}
	// 	}
	// }
	//
	// function onmove(e) {
	// 	if (sidebar && sidebar.contains(e.target)) {
	// 		let x = e.touches[0].pageX,
	// 			y = e.touches[0].pageY,
	// 			time = Date.now(),
	// 			diff = posX - x;
	//
	// 		if (posX && posY) {
	// 			let delta = time - oldTime,
	// 				velocityX = Math.abs(posX - x) / delta,
	// 				velocityY = Math.abs(posY - y) / delta;
	//
	// 			if (velocityX > velocityY) {
	// 				direction = posX < x ? RIGHT : LEFT;
	// 			} else {
	// 				direction = OTHER;
	// 			}
	// 		}
	//
	// 		oldTime = time;
	// 		posX = x;
	// 		posY = y;
	//
	// 		if (direction === LEFT || direction === RIGHT) {
	// 			position = Math.max(Math.min(diff - position, 0), elemWidth - bodyWidth);
	//
	// 			translate(sidebar, position);
	// 			opacity(overlay, position * -1 / elemWidth);
	//
	// 			e.preventDefault();
	// 		}
	// 	}
	// }

	// function onstart(e) {
	// 	sidebar = sidebar || document.querySelector(".sidebar-right");
	//
	// 	if (sidebar && sidebar.contains(e.target)) {
	// 		sidebar = document.querySelector(".sidebar-right");
	// 		overlay = document.querySelector(".sidebar-overlay");
	//
	// 		elemWidth = sidebar.clientWidth;
	// 		bodyWidth = document.body.clientWidth;
	//
	// 		let t = sidebar.style.transform,
	// 			x = t ? t.replace(/^translate3d\(/, "").split(",")[0] : 0;
	//
	// 		position = (/%$/).test(x) ? elemWidth * parseInt(x, 10) / 100 : parseInt(x, 10);
	//
	// 		if (e.target.className.indexOf("touch-target") && elemX < 20) {
	// 			translate(sidebar, -20);
	// 			opacity(overlay, 20 / elemWidth);
	//
	// 			position = -20;
	//
	// 			e.preventDefault();
	// 		}
	// 	}
	// }
	//
	// function onend(e) {
	// 	if (sidebar && sidebar.contains(e.target) && (direction === LEFT || direction === RIGHT)) {
	// 		if (position < bodyWidth - (elemWidth / 2)) {
	// 			core.emit("setstate", {
	// 				nav: { view: "sidebar-right" }
	// 			});
	// 		} else {
	// 			core.emit("setstate", {
	// 				nav: { view: null }
	// 			});
	// 		}
	// 	}
	// }
	//
	// function onmove(e) {
	// 	if (sidebar && sidebar.contains(e.target)) {
	// 		let x = e.touches[0].pageX,
	// 			y = e.touches[0].pageY,
	// 			time = Date.now(),
	// 			diff = posX - x;
	//
	// 		if (posX && posY) {
	// 			let delta = time - oldTime,
	// 				velocityX = Math.abs(posX - x) / delta,
	// 				velocityY = Math.abs(posY - y) / delta;
	//
	// 			if (velocityX > velocityY) {
	// 				direction = posX < x ? RIGHT : LEFT;
	// 			} else {
	// 				direction = OTHER;
	// 			}
	// 		}
	//
	// 		oldTime = time;
	// 		posX = x;
	// 		posY = y;
	//
	// 		if (direction === LEFT || direction === RIGHT) {
	// 			position = Math.max(Math.min(diff - position, 0), elemWidth - bodyWidth);
	//
	// 			translate(sidebar, position);
	// 			opacity(overlay, position * -1 / elemWidth);
	//
	// 			e.preventDefault();
	// 		}
	// 	}
	// }

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
