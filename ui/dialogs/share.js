/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  Dialog = require("./dialog.js")(core, config, store);

	class ShareDialog extends React.Component {
		constructor(props) {
			super(props);
		}

		render() {
			let dialogState = this.props.dialogState || {},
				url = encodeURIComponent(dialogState.shareUrl),
				text = encodeURIComponent(dialogState.shareText);

			return (
				<Dialog show={!!dialogState.shareUrl}>
					<div className="modal-content dialog-content">
						<h1 className="dialog-title">
							{`Share ${dialogState.shareType ? ` this ${dialogState.shareType}` : " "} via`}
						</h1>

						<p className="dialog-buttons">
							<a
								href={`https://www.facebook.com/dialog/share?app_id=1389363534614084&display=popup&redirect_uri=${url}&href=${url}`}
								target="_blank"
								className="button wide block facebook">Facebook</a>

							<a
								href={`https://plus.google.com/share?url=${url}`}
								target="_blank"
								className="button wide block googleplus">Google+</a>

							<a
								href={`https://twitter.com/intent/tweet?via=Scrollbackio&amp;url=${url}${text ? `&amp;text=${text}` : ""}`}
								target="_blank"
								className="button wide block twitter">Twitter</a>
						</p>

						<h4>Link to share</h4>
						<input className="wide block" type="text" value={dialogState.shareUrl} onClick={e => e.target.select()} readOnly />
					</div>
				</Dialog>
			);
		}
	}

	ShareDialog.propTypes = {
		dialogState: React.PropTypes.shape({
			shareUrl: React.PropTypes.string.isRequired,
			shareText: React.PropTypes.string.isRequired,
			shareType: React.PropTypes.string.isRequired
		})
	};

	return ShareDialog;
};
