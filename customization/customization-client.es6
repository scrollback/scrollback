/* eslint-env browser */

"use strict";

module.exports = (core, config, store) => {
	let customStyle = {
		removeCss: function() {
			let styleSheet = document.getElementById("scrollback-custom-css");

			if (styleSheet && document.head.contains(styleSheet)) {
				document.head.removeChild(styleSheet);
			}
		},

		applyCss: function() {
			this.removeCss();

			let roomObj = store.getRoom();

			if (!(roomObj && roomObj.guides && roomObj.guides.customization && roomObj.guides.customization.css)) {
				return;
			}

			let styleSheet = document.createElement("style");

			styleSheet.setAttribute("id", "scrollback-custom-css");

			styleSheet.appendChild(document.createTextNode("")); // fix webkit not recognizing styles

			document.head.appendChild(styleSheet);

			styleSheet.appendChild(document.createTextNode(roomObj.guides.customization.css.replace("<", "\\3c").replace(">", "\\3e")));
		}
	};

	core.on("statechange", changes => {
		let roomId = store.get("nav", "room");

		if ((changes.nav && ("room" in changes.nav || "mode" in changes.nav)) || (changes.entities && roomId in changes.entities)) {
			let mode = store.get("nav", "mode"),
				thread = store.get("nav", "thread");

			if (mode === "room" || (mode === "chat" && !thread)) {
				customStyle.applyCss();
			} else {
				customStyle.removeCss();
			}
		}
	}, 100);
};
