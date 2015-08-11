"use strict";

module.exports = function() {
	const React = require("react");

	class ToggleSwitch extends React.Component {
		constructor(props) {
			super(props);

			this.state = { checked: this.props.checked };
		}

		onChange(e) {
			let checked = e.target.checked;

			this.setState({ checked }, () => typeof this.props.onUpdate === "function" ? this.props.onUpdate(checked) : null);
		}

		get checked() {
			return this.state.checked;
		}

		render() {
			return (
				<label {...this.props} className={(this.props.className === "string" ? this.props.className : "") + " toggle-switch"}>
					<input
						type="checkbox"
						checked={this.state.checked}
						disabled={this.props.disabled}
						required={this.props.required}
						onChange={this.onChange.bind(this)}
					/>
					<span />
				</label>
			);
		}
	}

	ToggleSwitch.propTypes = {
		checked: React.PropTypes.bool.isRequired,
		disabled: React.PropTypes.bool,
		required: React.PropTypes.bool,
		className: React.PropTypes.string,
		onUpdate: React.PropTypes.func
	};

	return ToggleSwitch;
};
