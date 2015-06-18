/* eslint-env es6 */

"use strict";

const React = require("react");

module.exports = () => {
	class RequestInviteItem extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				text: this.props.text,
				status: 1,
				error: false
			};
		}

		onDone(text) {
			this.setState({
				text: text === false ? "An error occured!" : text,
				status: 0,
				error: (text === false)
			});
		}

		onAccept() {
			this.setState({ status: 2 });

			this.props.onAccept()
						.then(acceptText => this.onDone(acceptText))
						.catch(() => this.onDone(false));
		}

		onReject() {
			this.setState({ status: 3 });

			this.props.onReject()
						.then(rejectText => this.onDone(rejectText))
						.catch(() => this.onDone(false));
		}

		render() {
			let acceptClass = "",
				rejectClass = "";

			switch (this.state.status) {
			case 0:
				acceptClass = "disabled";
				rejectClass = "disabled";
				break;
			case 2:
				acceptClass = "working";
				break;
			case 3:
				rejectClass = "working";
				break;
			}

			return (
					<div className={"request-item-wrapper" + (this.state.error ? " error" : "")}>
						<div className="request-item">
							<img className="request-item-avatar" src={this.props.avatar} />
							<div className="request-item-message">{this.state.text}</div>
							<div className="request-item-actions">
								<a onClick={this.onAccept.bind(this)} className={"button accept " + acceptClass}>{this.props.acceptLabel}</a>
								<a onClick={this.onReject.bind(this)} className={"button reject " + rejectClass}>{this.props.rejectLabel}</a>
							</div>
						</div>
					</div>
					);
		}
	}

	return RequestInviteItem;
};
