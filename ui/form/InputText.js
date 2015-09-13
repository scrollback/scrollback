"use strict";

module.exports = () => {
	const React = require("react");

	class InputText extends React.Component {
		constructor(props) {
			super(props);
		}

		validateField() {
			let value = React.findDOMNode(this).value;

			if (this.isRequired && !value) {
				return false;
			}

			if (typeof this.props.validate === "function") {
				return this.props.validate(value);
			}

			return true;
		}

		onInput(e) {
			this.validateField();

			if (typeof this.props.onInput === "function") {
				this.props.onInput(e);
			}
		}

		render() {
			return <input type="text" {...this.props} onInput={this.onInput.bind(this)} />;
		}
	}

	InputText.propTypes = {
		validate: React.PropTypes.func,
		onInput: React.PropTypes.func
	};

	return InputText;
};
