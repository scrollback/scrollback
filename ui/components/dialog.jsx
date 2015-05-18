/* eslint-env es6, browser */

"use strict";

module.exports = (core) => {
	const React = require("react");

	let Dialog = React.createClass({
		getInitialState: function() {
			return { show: this.props.show };
		},

		dismiss: function(e) {
			if (this.state.show === false || this.props.dismiss === false) {
				return;
			}

			let modal = React.findDOMNode(this.refs.modal),
				backdrop = React.findDOMNode(this.refs.backdrop);

			setTimeout(() => {
				this.setState({ show: false });

				core.emit("setstate", {
					nav: { dialog: null }
				});

				if (typeof this.props.onDismiss === "function") {
					this.props.onDismiss(e, modal);
				}
			}, 300);

			modal.classList.add("out");
			backdrop.classList.add("out");
		},

		render: function() {
	        if (this.state.show) {
				return (
					<div className="modal-container dialog-container">
						<div ref="backdrop" className="backdrop" onClick={this.dismiss}></div>

	                    <div ref="modal" {...this.props} className={"modal dialog " + this.props.className}>
							{(this.props.dismiss === false || this.props.closebutton === false) ? "" : <span className="modal-close" onClick={this.dismiss} />}

	                        {this.props.children}
	                    </div>
					</div>
				);
			} else {
				return <div data-mode="none" />;
			}
		},

		componentWillReceiveProps: function(nextProps) {
			this.setState({ show: nextProps.show });
		},

		componentDidUpdate: function() {
			if (this.state.show && typeof this.props.onShow === "function") {
				let modal = React.findDOMNode(this.refs.modal);

				this.props.onShow({ type: "update" }, modal);
			}
		}
	});

	return Dialog;
};
