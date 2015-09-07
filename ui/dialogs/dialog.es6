/* eslint-env es6 */

"use strict";

module.exports = core => {
	const React = require("react");

	class Dialog extends React.Component {
		constructor(props) {
			super(props);

			this.state = { show: this.props.show };
		}

		dismiss(e) {
			if (this.state.show === false || this.props.dismiss === false) {
				return;
			}

			setTimeout(() => {
				this.setState({ show: false });

				core.emit("setstate", {
					nav: { dialog: null }
				});

				if (typeof this.props.onDismiss === "function") {
					this.props.onDismiss(e, this._modal);
				}
			}, 300);

			if (this._modal) {
				this._modal.classList.add("out");
			}

			if (this._backdrop) {
				this._backdrop.classList.add("out");
			}
		}

		render() {
			if (this.state.show === false) {
				return <null />;
			}

			return (
				<div className="modal-container dialog-container">
					<div ref={c => this._backdrop = React.findDOMNode(c)} className="backdrop" onClick={this.dismiss.bind(this)}></div>

					<div className="modal-wrapper-outer">
						<div className="modal-wrapper">
							<div className="modal-wrapper-inner">
								<div
									{...this.props}
									ref={c => this._modal = React.findDOMNode(c)}
									className={"modal dialog " + (typeof this.props.className === "string" ? this.props.className : "")}>

									{(this.props.dismiss === false || this.props.closebutton === false) ? "" : <span className="modal-close" onClick={this.dismiss.bind(this)} />}

									{this.props.children}
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}

		componentWillReceiveProps(nextProps) {
			if (nextProps.show === false) {
				this.dismiss();
			} else {
				this.setState({ show: nextProps.show });
			}
		}

		componentDidUpdate() {
			if (this.state.show && typeof this.props.onShow === "function") {
				this.props.onShow({ type: "update" }, this._modal);
			}
		}
	}

	Dialog.defaultProps = {
		show: true
	};

	Dialog.propTypes = {
		className: React.PropTypes.string,
		children: React.PropTypes.oneOfType([ React.PropTypes.element, React.PropTypes.arrayOf(React.PropTypes.element) ]).isRequired,
		onDismiss: React.PropTypes.func,
		onShow: React.PropTypes.func,
		show: React.PropTypes.bool,
		dismiss: React.PropTypes.bool,
		closebutton: React.PropTypes.bool
	};

	return Dialog;
};
