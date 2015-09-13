/* eslint-env browser */

"use strict";

module.exports = (core, config, store) => {
	const NotificationItem = require("./notification-item.js")(core, config, store),
		  regexUtils = require("../lib/regex-utils.js"),
		  audio = "data:audio/wav;base64,UklGRnQGAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YU8GAACBgIF/gn2Cf4B+gn5+fYJ/gIF/gH+BfX6AfXt5fXx7e3x9fH1+f4CAfnx9f3t9gIB9en2Dfn58fYKDgIJ9hnh7hIZ8gYR6fHyCe4GCioF+gH93foWCgoJ5gHx5gniAeYJ0dneCgXN1jn1+fI1zfHp8dYiCe3qIhHpmfXqMeZJ0ACb/AAD//wAAQ/8A3pYANv/qYek5OGp3tICeexjYUkWgYMzzAB//hDyVcX2Yi5ppXLNsXYKEZ3l7aHGTn1pnlZlwVpuUgqOKgIOMYIpsoXVydJKdc296kZl3h3OAcoV6ao6Be298ipCFhIFxk3yIeXNuh4eHiYh/c3h1eJCUenCCfH9yeZSKcHR7eH9ugYl+eImFfWxuhX1uiIx+gYZmg355hHlzgXl1dIeWdGmciXpteYWMc3GOfntye5Khh1+beoaFgmJ5k4KUe3CXim2GdJaFYXmec1GomG97b4mZcnCIbX6EbX6LbWd1e4B0d4x6cXuKcoKMdoB5eZt9doh0e32Ag5CSgnOEkIWBgX6AeYqRenJ9hoKDhIR6gIBte42DeHuFhm18g35we4x9dnmBgHp+bniBfIF2eYB3fYV3dX+FdIOCf3Z7foF8e4mAfHuCdn+Lc3WKhXyEhnt7goF4foSDhH17f4uFfnp/io90c4OBfHuCg4JyhIxycH2JgnuDiHl8hH98dIODdIKBeIZ8fHeCiXx+f3SIf3V7eYSCdHuCgnh6hIFzioV3gYuAeXl9e4V7e3+JgnV6gIJ7hIiCe3yIinx9hYGAhX17h4OBfICFfIiFfHh9hn93gnp2hYR6foF4dn9/dX1/eX9/dHN+goB3eoF8fHt6f316fIF6gIF8eH2Cgnt/goV6iHx3iIR6f4CDg3uGg3yAiIN9g4B/gn+CgX59hn96fn+FfX59f4SCgIR7foJ7fYGAfoF6f4F5fHyDfXmFfnt5hIB5fn1/fX1+gHl9foN8fYGCfoCGen6AgoB/gH9/g3p8fYWGfXqDhH17gIOCfn+CeoCDg3p6fIGFfXp/gYR9dYN/gX57e359foJ9foGAf357gICAfIJ7fn16hoV6fXyAgX+Bfn5+gnl5gYSBfH19e4h7fISEeIB+gH+Ed3+Cf3p6hX2Af3qAfX5/fn98f4GBgHt3gYZ/fX99gHx8gH97hoR3gX5/g3l+g31/g315f4N8fX+AgX6Af35+gH6AgX97foCCfX99gn1+gYF7gIR9en+DgH59f319gYB8fn1/f32Be3uCgXx+fYR/fH2Cf31+foKEfHyBg31/fn5/goJ7gIaAfX9/gn+Bgn56g4J/goF/foB/gIB/fn+Bf3uAgn96f398gIB/fnyAgHx9fn5+f3p+gnx9f3x/f398f399gH9/fn6Df3yBf39/gIB9f4F/gYF+f4CCfoF/f4KCgICAf4KAg4B+f4KCfX59goN9fYB/gIB6gH99fICAfX1/gnx7fYB/gXx9fn5/fn99fX5+fX5+fn5/f39/gX5/gnx+gIF/foCCfn2Af4J+foGBgX9/f4CCfIGAgYF/f36AgYB+gIGAgH2AgX99gH9/gH2Af3+AfXx9gHx+fHyAfX5+fH2Agnt7f35/fX9/f39/fXp+gH5+goB9f39/gn59gX+Af31/gIB/f39/gH6AgICBfoCEf4B+f4KBf4B/gYGDfn+Af4B/fn59foF+foKBfn9+fHyAfn5+fn+BeX+Fg3N7hX58gH+Afn6FdHuIgnh+g4B6e4iGeHqFhXh7g3+Af36Ag4SAeX+Een1+g4V7en6Ef3+AgX9/f4B+fHx+foJ/fH6ChHx9foGBg3t5foJ/f3x+fYF+f31+gICBgX5/f4F+fn5/fX59fn9+gIOAf3+Af4B9fn9+gX9+gX+BfoGBgIB/f31/gn+CfIB/fYF+f36Bf35/foB/f398gX+Af31/f4CBf358gIKAfn9+gn2Af35+gn99f36Bf31+f3+Af399f4CBfoCAfX+BfX+AgH6AgH9+gIZ9fYJ/iIB3fIt/dISBgHx/f4OFf32AgX53fIOCe4KBfn2Ben57f3t4f4N9gH6BgYKAgHl/gn1/f4N/f36DgoCBfoJ+eX17gH18e4F/fYB+hX6Dg4OBgIB8fHt+f39+fX9/foKBgIGEf31/gX6AgoGDfoCEf32BAA==";

	let browserNotify = (function() {
		let hasFocus = false,
			notifyStatus = false,
			newTitle,
			originalTitle,
			titleTimer,
			soundTimer,
			play = (() => {
				let el;

				return function() {
					if (!el) {
						el = document.createElement("span");

						el.setAttribute("id", "notify-sound");
						el.style.display = "none";

						document.body.appendChild(el);
					}

					el.innerHTML = '<audio autoplay><source src="' + audio + '" type="audio/wav">' +
								   '<embed hidden="true" autostart="true" loop="false" src="' + audio + '"></audio>';
				};
			})();

		window.addEventListener("focus", () => {
			if (originalTitle) {
				document.title = originalTitle;
				originalTitle = null;
			}

			if (titleTimer) {
				clearInterval(titleTimer);
			}

			hasFocus = true;
			notifyStatus = false;
		}, false);

		window.addEventListener("blur", () => hasFocus = false, false);

		hasFocus = document.hasFocus();

		return function(text, important, sound) {
			if (hasFocus) {
				return;
			}

			if (!originalTitle) {
				originalTitle = document.title;
			}

			newTitle = text;

			if (!notifyStatus) {
				clearInterval(titleTimer);

				titleTimer = setInterval(function() {
					let count = store.get("notes").length,
						regex = new RegExp("(\([0-9]+\) )?" + regexUtils.escape(originalTitle));

					document.title = (count ? "(" + count + ") " : "") + ((regex.test(document.title)) ? newTitle : originalTitle);

					notifyStatus = true;
				}, 1000);
			}

			if (important && soundTimer) {
				clearTimeout(soundTimer);
				soundTimer = null;
			}

			if (sound && !soundTimer) {
				play();

				soundTimer = setTimeout(function() {
					soundTimer = null;
				}, 30000);
			}
		};
	}());

	core.on("note-dn", note => {
		if (typeof note.dismissTime === "number") {
			return;
		}

		let item = new NotificationItem(note),
			user = store.getUser(),
			sound = (
						(user.params && user.params.notifications && user.params.notifications.sound === false) ||
						(store.get("context", "embed", "alertSound") === false)
			        ) ? false : true;

		browserNotify(item.summary, true, sound);
	}, 1);

	window.addEventListener("blur", () => browserNotify(document.title, false, false));
};
