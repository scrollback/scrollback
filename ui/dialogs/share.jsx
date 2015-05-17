/* eslint-env es6, browser */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  Dialog = require("../components/dialog.jsx")(core, config, store);

	let ShareDialog = React.createClass({
		selectLink: function(e) {
			e.target.select();
		},

		render: function() {
			let url = encodeURIComponent(this.state.url),
				text = encodeURIComponent(this.state.text);

			return (
				<Dialog ref="dialog" onDismiss={this.onDismiss} show={this.state.show}>
					<div className="modal-content">
						<h1 className="dialog-title">{"Share" + (this.state.type ? " this " + this.state.type : " ") + " via"}</h1>
						<p className="dialog-buttons">
							<a href={"https://www.facebook.com/dialog/share?app_id=1389363534614084&display=popup&redirect_uri=" + url + "&href=" + this.state.url} target="_blank"
							   className="button wide block facebook">Facebook</a>
							<a href={"https://plus.google.com/share?url=" + url} target="_blank"
							   className="button wide block googleplus">Google+</a>
							<a href={"https://twitter.com/intent/tweet?via=Scrollbackio&amp;url=" + url + (text ? "&amp;text=" + text : "")} target="_blank"
							   className="button wide block twitter">Twitter</a>
						</p>
						<h4>Link to share</h4>
						<input className="wide block" type="text" value={this.state.url} onClick={this.selectLink} readonly="true" />
					</div>
				</Dialog>
			);
		},

		getInitialState: function() {
			let dialog = store.get("nav", "dialog") || {},
				dialogState = store.get("nav", "dialogState") || {};

			return {
				url: dialogState.shareUrl,
				text: dialogState.shareText,
				type: dialogState.shareType,
				show: (dialog === "share" && dialogState && dialogState.shareUrl)
			};
		},

		onStateChange: function(changes) {
			if (changes.nav && ("dialog" in changes.nav || "dialogState" in changes.nav)) {
				let dialog = store.get("nav", "dialog");

				if (dialog === "share") {
					let dialogState = store.get("nav", "dialogState");

					if (dialogState && dialogState.shareUrl) {
						this.setState({
							url: dialogState.shareUrl,
							text: dialogState.shareText,
							type: dialogState.shareType,
							show: true
						});
					} else {
						this.setState({ show: false });
					}
				}
			}
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return ShareDialog;
};
