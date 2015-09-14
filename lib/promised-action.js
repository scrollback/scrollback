"use strict";

module.exports = core => {
	return (name, params = {}, prio = 1) => {
		if (typeof name !== "string") {
			throw new TypeError(`Invalid action ${name}`);
		}

		return new Promise((resolve, reject) => {
			let down = name + "-dn",
				id;

			function onError(error) {
				if (id === error.id) {
					reject(error);

					core.off(down, onDone); // eslint-disable-line no-use-before-define
					core.off("error-dn", onError);
				}
			}

			function onDone(action) {
				if (id === action.id) {
					resolve(action);

					core.off(down, onDone);
					core.off("error-dn", onError);
				}
			}

			core.on(down, onDone, prio);
			core.on("error-dn", onError, prio);

			core.emit(name + "-up", params, (err, action) => {
				if (err) {
					reject(err);

					core.off(down, onDone);
					core.off("error-dn", onError);

					return;
				}

				id = action.id;
			});
		});
	};
};
