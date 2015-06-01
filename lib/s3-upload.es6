/* eslint-env es6, browser */

"use strict";

class S3Upload {
	constructor(opts, core) {
		if (!opts) {
			throw new Error("options must be passed.");
		}

		if (!opts.uploadType) {
			throw new Error("uploadType must be specified.");
		}

		if (!opts.userId) {
			throw new Error("userId must be specified.");
		}

		if (opts.uploadType === "content" && !opts.textId) {
			throw new Error("textId must be specified for content.");
		}

		this._opts = opts;

		this._policy = new Promise((resolve, reject) => {
			core.emit("getPolicy", opts, (err, req) => {
				if (err) {
					reject(err);

					return;
				}

				if (req) {
					resolve(req.response);

					return;
				}
			});
		});

		this.request = new XMLHttpRequest();
	}

	start(file) {
		this.request.addEventListener("progress", event => {
			if (typeof this.onprogress === "function") {
				this.onprogress(event);
			}
		}, false);

		this.request.addEventListener("abort", event => {
			if (typeof this.onabort === "function") {
				this.onabort(event);
			}
		}, false);

		return this._policy.then(policy => {
			let formData = new FormData(),
				fields = [
					"acl", "policy", "x-amz-algorithm", "x-amz-credential",
					"x-amz-date", "x-amz-signature"
				];

			for (let field of fields) {
				formData.append(field, policy[field]);
			}

			let filename;

			switch (this._opts.uploadType) {
			case "avatar":
			case "banner":
				filename = "original." + file.name.split(".").pop();
				break;
			case "content":
				filename = "1/${filename}";
				break;
			}

			formData.append("key", policy.keyPrefix + filename);
			formData.append("success_action_status", "201");
			formData.append("file", file);

			let baseurl = "https://" + policy.bucket + ".s3.amazonaws.com/";

			this.request.addEventListener("load", event => {
				let path = this._opts.uploadType + "/" + this._opts.userId + "/";

				if (this._opts.uploadType === "content") {
					path += this._opts.textId + "/1/";
				}

				this.url = baseurl + encodeURIComponent("uploaded/" + path) + file.name.replace(/\s/g, "+");
				this.thumb = baseurl + "generated/" + path + "480x960.jpg";

				if (typeof this.onfinish === "function") {
					this.onfinish(event);
				}
			}, false);

			this.request.open("POST", baseurl, true);

			this.request.send(formData);
		});
	}

	abort() {
		return this.request.abort();
	}

	set onerror(fn) {
		this.request.addEventListener("abort", fn, false);

		this._policy.catch(fn);
	}
}

module.exports = S3Upload;
