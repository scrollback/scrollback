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

		let uploadType = opts.uploadType,
			textId = opts.textId;

		if (uploadType === "content" && !textId) {
			throw new Error("textId must be specified for content.");
		}

		this._opts = opts;

		this._policy = new Promise((resolve, reject) => {
			core.emit("upload/getPolicy", { uploadType, textId }, (err, req) => {
				if (err) {
					reject(err);

					return;
				}

				if (req) {
					if (req.response) {
						resolve(req.response);
					} else {
						reject(err);
					}

					return;
				}
			});
		});

		this._policy.catch(err => {
			if (typeof this.onerror === "function") {
				this.onerror(err);
			}
		});

		this.request = new XMLHttpRequest();
	}

	_generateThumb(event) {
		let thumbTimer, startTime = Date.now(),
			checkThumb = () => {
				let req = new XMLHttpRequest();

				req.open("GET", this.thumb, true);

				req.send();

				req.onreadystatechange = () => {
					if (req.readyState === XMLHttpRequest.DONE ) {
						if (thumbTimer) {
							clearTimeout(thumbTimer);
						}

						if (req.status === 200) {
							if (typeof this.onfinish === "function") {
								this.onfinish(event);
							}
						} else {
							if (Date.now() - startTime > 30000) {
								if (typeof this.onerror === "function") {
									this.onerror(new Error("Thumbnail generation timed out!"));
								}

								return;
							}

							thumbTimer = setTimeout(checkThumb, 1500);
						}
					}
				};
			};

		setTimeout(checkThumb, 3000);
	}

	start(file) {
		this.request.onprogress = this.onprogress;
		this.request.onabort = this.onabort;
		this.request.onerror = this.onaerror;

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

				if (typeof this.onfinish === "function") {
					if (this._opts.generateThumb) {
						this.thumb = baseurl + "generated/" + path + "480x960.jpg";

						this._generateThumb(event);
					} else {
						this.onfinish(event);
					}
				}
			}, false);

			this.request.open("POST", baseurl, true);

			this.request.send(formData);
		});
	}

	abort() {
		return this.request.abort();
	}
}

module.exports = S3Upload;
