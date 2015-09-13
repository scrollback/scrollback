/* eslint-env es6 */

"use strict";

module.exports = core => {
	return (query, params = {}) => {
		if (typeof name !== "string") {
			throw new TypeError(`Invalid query ${query}`);
		}

		return new Promise((resolve, reject) => {
			core.emit(query, params, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res);
				}
			});
		});
	};
};
