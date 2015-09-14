/* eslint-env browser */

"use strict";

module.exports = core => {

	function dismissLoading() {
		let splash = document.getElementById("splash-screen");

		splash.style.opacity = 0;

		setTimeout(() => splash.style.display = "none", 300);

		core.off("init-dn", dismissLoading);
	}

	core.on("init-dn", dismissLoading, 1);
};
