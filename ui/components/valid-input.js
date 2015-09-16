/* eslint-env browser */

"use strict";

module.exports = () => {
	const React = require("react"),
		  ReactDOM = require("react-dom");

	class ValidInput extends React.Component {
		constructor(props) {
			super(props);
		}

		onInput() {
			let value = ReactDOM.findDOMNode(this).value;

			let result = this.props.validator(value);

			if (typeof result === "boolean") {
				// Result in a boolean
				if (result) {
					this.props.onValidateSuccess(value);
				} else {
					this.props.onValidateError(value);
				}
			} else if (result && typeof result.then === "function" && typeof result.catch === "function") {
				// Result is a promise/thenable
				result
					.then(() => this.props.onValidateSuccess(value))
					.catch(err => this.props.onValidateError(value, err));
			} else {
				this.props.onValidateError(value, result);
			}
		}

		render() {
			return <input type="text" onInput={this.onInput} {...this.props} />;
		}
	}

	ValidInput.propTypes = {
		validator: React.PropTypes.func.isRequired,
		onValidateSuccess: React.PropTypes.func.func.isRequired,
		onValidateError: React.PropTypes.func.isRequired
	};

	return ValidInput;
};
