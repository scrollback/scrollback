/* eslint-env es6, browser */

"use strict";

module.exports = core => {

	class S3Upload {
		constructor(opts) {
			if (!(opts && opts.uploadType)) {
				throw new Error("No uploadType specified!");
			}

			this._policy = new Promise((resolve, reject) => {
				core.emit("getPolicy", opts, (err, res) => {
					if (err) {
						reject(err);

						return;
					}

					if (res) {
						resolve(res);

						return;
					}
				});
			});
		}

		start(files) {
			return this._policy.then(policy => {
				let formData = new FormData();

				// Need to add the policy and files properly to the formData
				for (let file of files) {
					formData.append("name", file, file.name);
				}

				let xhr = new XMLHttpRequest();

				xhr.open("POST", "/path/to/upload", true);

				xhr.addEventListener("progress", event => {
					if (typeof this.onprogress === "function") {
						this.onprogress(event);
					}
				}, false);

				xhr.addEventListener("load", event => {
					if (typeof this.onfinish === "function") {
						this.onfinish(event);
					}
				}, false);

				xhr.addEventListener("error", event => {
					if (typeof this.onerror === "function") {
						this.onerror(event);
					}
				}, false);

				xhr.addEventListener("abort", event => {
					if (typeof this.onabort === "function") {
						this.onabort(event);
					}
				}, false);

				xhr.send();
			});
		}

		set onerror(fn) {
			this.onerror = fn;

			this._policy.catch(fn);
		}
	}
};
