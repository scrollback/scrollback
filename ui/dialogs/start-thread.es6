/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  Dialog = require("./dialog.es6")(core, config, store),
		  FileUpload = require("../components/file-upload.jsx")(core, config, store),
		  promisedAction = require("../../lib/promised-action.es6")(core),
		  generate = require("../../lib/generate.browser.js");

	class StartThreadDialog extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				show: store.get("nav", "dialog") === "start-thread",
				activeInput: "text"
			};
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
				return Promise.reject("Title cannot be empty!");
			}

			let id, text;

			if (this.state.activeInput === "text") {
				if (!opts.text) {
					return Promise.reject("Text cannot be empty!");
				} else {
					text = opts.text;
					id = generate.uid(32);
				}
			} else {
				if (!this.state.uploadData) {
					return Promise.reject("Image cannot be empty!");
				} else {
					let { upload, payload } = this.state.uploadData;

					text = "[![" + upload.file.name + "](" + upload.thumb + ")](" + upload.url + ")";
					id = payload.id;
				}
			}

			return promisedAction("text-up", {
				id: id,
				to: store.get("nav", "room"),
				from: store.get("user"),
				text: text,
				thread: id,
				title: opts.title
			});
		}

		onSubmit(e) {
			e.preventDefault();

			let title = this._title.value,
				text = this._text.value,
				image = this._image.value;

			this.startThread({ title, text, image })
			.then(() => {
				core.emit("setstate", {
					nav: { dialog: null }
				});
			})
			.catch(() => {
				this.showError(this._title);
			});
		}

		render() {
			let uploadStatus;

			switch (this.state.uploadStatus) {
			case "active":
				uploadStatus = "Uploading image...";
				break;
			case "complete":
				uploadStatus = <img src={this.state.uploadData.upload.thumb} />;
				break;
			default:
				uploadStatus = "Click to select image.";
			}

			return (
				<Dialog className="start-thread-dialog">
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
										className={"area " + (this.state.activeInput === "text" ? "active" : "")}
										placeholder="Enter your message"
										style={{ resize: "none" }}
										autoFocus
										/>

									<FileUpload
										ref={c => this._image = React.findDOMNode(c)}
										className={"image-drop-area area " + (this.state.activeInput === "image" ? " active" : "")}
										accept="image/*" maxsize={5242880}
										onstart={this.onUploadStart} onerror={this.onUploadError} onfinish={this.onUploadFinish}
										getPayload={this.getUploadPayload}>

										{uploadStatus}

									</FileUpload>
								</div>
								<div className="start-thread-buttons wide block" data-role="registered follower owner moderator">
									<a
										className={"start-thread-text " + (this.state.activeInput === "text" ? "active" : "")}
										onClick={() => this.setState({ activeInput: "text" })}>
										Text
									</a>
									<a
										className={"start-thread-image " + (this.state.activeInput === "image" ? "active" : "")}
										onClick={() => this.setState({ activeInput: "image", uploadStatus: "", uploadData: null })}>
										Image
									</a>
								</div>
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
