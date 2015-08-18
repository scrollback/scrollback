/* eslint-env es6, browser, jquery */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  Dialog = require("./dialog.es6")(core, config, store),
		  Loader = require("../components/loader.jsx")(core, config, store),
		  FileUpload = require("../components/file-upload.jsx")(core, config, store),
		  promisedAction = require("../../lib/promised-action.es6")(core),
		  generate = require("../../lib/generate.browser.js");

	class StartThreadDialog extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				show: true,
				activeInput: "text"
			};
		}

		showError(message) {
			let error = document.createElement("div"),
				content = document.createElement("div"),
				origin;

			if (message.indexOf("Text") === 0) {
				origin = this._text;
			} else if (message.indexOf("Image") === 0) {
				origin = this._image;
			} else {
				origin = this._title;
			}

			error.className = "error";
			content.className = "popover-content";
			content.textContent = message;

			error.appendChild(content);

			origin.classList.add("error");

			$(error).popover({ origin });

			$(document).one("popoverDismissed", () => origin.classList.remove("error"));
		}

		onUploadStart() {
			this.setState({ uploadStatus: "active" });
		}

		onUploadError() {
			this.setState({ uploadStatus: "error" });
		}

		onUploadFinish(payload, upload) {
			this.setState({
				uploadStatus: "complete",
				uploadData: { payload, upload }
			});
		}

		getUploadPayload() {
			return {
				uploadType: "content",
				generateThumb: true,
				userId: store.get("user"),
				textId: generate.uid(32)
			};
		}

		isFileUploadAvailable() {
			if (window.Android) {
				return (typeof window.Android.isFileUploadAvailable === "function" && window.Android.isFileUploadAvailable());
			} else {
				return true;
			}
		}

		startThread(opts) {
			if (!opts.title) {
				return Promise.reject(new Error("Title cannot be empty!"));
			}

			let id, text, user;

			if (this.state.activeInput === "text") {
				if (!opts.text) {
					return Promise.reject(new Error("Text cannot be empty!"));
				} else {
					text = opts.text;
					id = generate.uid(32);
					user = store.get("user");
				}
			} else {
				if (!this.state.uploadData) {
					return Promise.reject(new Error("Image cannot be empty!"));
				} else {
					let { upload, payload } = this.state.uploadData;

					text = "[![" + upload.file.name + "](" + upload.thumb + ")](" + upload.url + ")";
					id = payload.textId;
					user = payload.userId;
				}
			}

			return promisedAction("text", {
				id: id,
				to: store.get("nav", "room"),
				from: user,
				text: text,
				thread: id,
				title: opts.title
			});
		}

		onImageButtonClick() {
			this.setState({
				activeInput: "image",
				uploadStatus: "",
				uploadData: null
			});

			this._image.click();
		}

		onSubmit(e) {
			e.preventDefault();

			let title = this._title.value,
				text = this._text.value,
				image = this._image.value;

			this.startThread({ title, text, image })
			.then(thread => {
				this.setState({ show: false });

				setTimeout(() => {
					core.emit("setstate", {
						nav: {
							mode: "chat",
							thread: thread.id
						}
					});
				}, 300);
			})
			.catch(err => this.showError(err.message));
		}

		componentDidUpdate(prevProps, prevState) {
			if (prevState.uploadStatus !== this.state.uploadStatus && this.state.uploadStatus === "error") {
				this.showError("Image upload failed! Try again later, maybe?");
			}
		}

		render() {
			let uploadStatus;

			switch (this.state.uploadStatus) {
			case "active":
				uploadStatus = <Loader key="loader" status={this.state.uploadStatus} />;
				break;
			case "complete":
				uploadStatus = <img src={this.state.uploadData.upload.thumb} />;
				break;
			default:
				uploadStatus = <span>Click to select image</span>;
			}

			return (
				<Dialog className="start-thread-dialog" show={this.state.show}>
					<div className="modal-content dialog-content">
						<h1 className="dialog-title">Start a new discussion</h1>
						<form onSubmit={this.onSubmit.bind(this)}>
							<input
								ref={c => this._title = React.findDOMNode(c)}
								className="wide block"
								type="text"
								placeholder="Enter discussion title"
								autoFocus
							/>

							<div className="wide block start-thread-inputs-container">
								<div className="start-thread-inputs">
									<textarea
										ref={c => this._text = React.findDOMNode(c)}
										className={(this.state.activeInput === "text" ? "active" : "")}
										placeholder="Enter your message"
										style={{ resize: "none" }}
										/>

									<FileUpload
										ref={c => this._image = React.findDOMNode(c)}
										className={"image-drop-area " + (this.state.activeInput === "image" ? " active" : "") + " upload-" + this.state.uploadStatus}
										accept="image/*" maxsize={5242880}
										onstart={this.onUploadStart.bind(this)}
										onerror={this.onUploadError.bind(this)}
										onfinish={this.onUploadFinish.bind(this)}
										getPayload={this.getUploadPayload}>

										{uploadStatus}

									</FileUpload>
								</div>
								{this.isFileUploadAvailable() ?
								<div className="start-thread-buttons wide block" data-role="registered follower owner moderator">
									<a
										className={"start-thread-text " + (this.state.activeInput === "text" ? "active" : "")}
										onClick={() => this.setState({ activeInput: "text" })}>
										Text
									</a>
									<a
										className={"start-thread-image " + (this.state.activeInput === "image" ? "active" : "")}
										onClick={this.onImageButtonClick.bind(this)}>
										Image
									</a>
								</div> : null}
						   </div>
							<input className="wide block" type="submit" value="Start discussion" />
						</form>
					</div>
				</Dialog>
			);
		}
	}

	return StartThreadDialog;
};
