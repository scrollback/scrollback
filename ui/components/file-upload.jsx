/* eslint-env es6, browser */

"use strict";

const S3Upload = require("../../lib/s3-upload.es6");

module.exports = core => {
	const React = require("react");

	class FileUpload extends React.Component {
		constructor(props) {
			super(props);
		}

		uploadFiles(e) {
			let file = e.target.files[0];

			if (file.size > (typeof this.props.maxsize === "number" ? this.props.maxsize : 5242880)) {
				let size = Math.round(file.size * 100 / 1048576) / 100;

				if (typeof this.props.onerror === "function") {
					this.props.onerror("File is too big (" + size + "MB). Only files upto 5MB can be uploaded.");
				}

				return;
			}

			let payload = this.props.getPayload(),
				upload = new S3Upload(payload, core);

			if (typeof this.props.onstart === "function") {
				this.props.onstart(payload, upload);
			}

			upload.onfinish = () => {
				if (typeof this.props.onfinish === "function") {
					this.props.onfinish(payload, upload);
				}
			};

			upload.onerror = () => {
				if (typeof this.props.onerror === "function") {
					this.props.onerror("Failed to upload the image. May be try again?");
				}
			};

			upload.start(file);

			// Hacky way to clear file input
			try {
				e.target.value = "";

				if (e.target.value) {
					e.target.type = "text";
					e.target.type = "file";
				}
			} catch (err) {
				console.warn("Error clearing file input", err);
			}
		}

		click() {
			return this._chooser.click();
		}

		render() {
			return (
				<label {...this.props}>
					<input
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							height: 0,
							width: 0,
							opacity: 0
						}}
						ref={c => this._chooser = React.findDOMNode(c)}
						type="file"
						onChange={this.uploadFiles.bind(this)}
						accept={this.props.accept} />
					{this.props.children}
				</label>
			);
		}
	}

	FileUpload.propTypes = {
		children: React.PropTypes.any,
		maxsize: React.PropTypes.number,
		accept: React.PropTypes.string,
		onerror: React.PropTypes.func,
		onstart: React.PropTypes.func,
		onfinish: React.PropTypes.func,
		getPayload: React.PropTypes.func.isRequired
	};

	return FileUpload;
};
