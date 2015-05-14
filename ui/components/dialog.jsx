/* eslint-env es6, browser */

"use strict";

module.exports = () => {
	const React = require("react");

	let Dialog = React.createClass({
		onDismiss: function(e) {
			let modal = React.findDOMNode(this.refs.modal),
				backdrop = React.findDOMNode(this.refs.backdrop);

			if (typeof this.props.onDismiss === "function") {
				this.props.onDismiss(e, modal);
			}

			setTimeout(() => {
				modal.style.opacity = 0;
				backdrop.style.opacity = 0;

				if (typeof this.props.onDismiss === "function") {
					this.props.onDismiss(e, modal);
				}
			}, 300);

			modal.classList.add("out");
			backdrop.classList.add("out");
		},

		render: function() {
			return (
					<div className="modal-container dialog-container">
						<div ref="backdrop" className="backdrop" onClick={this.onDismiss}></div>

                        <div ref="modal" {...this.props} className={"modal dialog " + this.props.className}>
                            {this.props.children}
                        </div>
					</div>
			);
		}
	});

	return Dialog;
};
