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

		this._request = new XMLHttpRequest();
	}

	_pollThumbUrl(event) {
		let thumbTimer, startTime = Date.now(),
			checkThumb = () => {
				let req = new XMLHttpRequest();

				req.open("GET", this.thumb, true);

				req.send();

				req.onreadystatechange = () => {
					if (req.readyState === XMLHttpRequest.DONE) {
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
		this._request.onprogress = this.onprogress;
		this._request.onabort = this.onabort;
		this._request.onerror = this.onerror;

		this.file = file;

		return this._policy.then(policy => {
			let formData = new FormData(),
				fields = [
					"acl", "policy", "x-amz-algorithm", "x-amz-credential",
					"x-amz-date", "x-amz-signature"
				];

			for (let field of fields) {
				formData.append(field, policy[field]);
			}

			const baseurl = "https://" + policy.bucket + ".s3.amazonaws.com/";

			let key = policy.keyPrefix,
				filename = file.name.replace(/\s+/g, " "),
				thumbpath;

			switch (this._opts.uploadType) {
			case "avatar":
			case "banner":
				thumbpath = "256x256.jpg";
				key += "original." + filename.split(".").pop();
				this.url = baseurl + key;
				break;
			case "content":
				thumbpath = "1/480x960.jpg";
				key += "1/" + filename;
				this.url = baseurl + policy.keyPrefix + "1/" + encodeURIComponent(filename);
				break;
			}

			formData.append("key", key);
			formData.append("success_action_status", "201");
			formData.append("file", file);

			this._request.addEventListener("load", event => {
				if (typeof this.onfinish === "function") {
					if (this._opts.generateThumb) {
						this.thumb = baseurl + policy.keyPrefix.replace(/^uploaded/, "generated") + thumbpath;

						this._pollThumbUrl(event);
					} else {
						this.onfinish(event);
					}
				}
			}, false);

			this._request.open("POST", baseurl, true);

			this._request.send(formData);
		});
	}

	abort() {
		return this._request.abort();
	}
}

module.exports = S3Upload;
