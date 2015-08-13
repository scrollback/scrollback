"use strict";

module.exports = function() {
	const React = require("react");

	class ToggleSwitch extends React.Component {
		constructor(props) {
			super(props);

			this.state = { checked: this.props.checked };
		}

		onChange(e) {
			this.setState({ checked: e.target.checked });

			if (typeof this.props.onChange === "function") {
				this.props.onChange(e);
			}
		}

		get checked() {
			return this.state.checked;
		}

		render() {
			return (
				<label {...this.props} className={(this.props.className === "string" ? this.props.className : "") + " toggle-switch"}>
					<input type="checkbox" checked={this.state.checked} onChange={this.onChange.bind(this)} />
					<span />
				</label>
			);
		}
	}

	ToggleSwitch.propTypes = {
		 checked: React.PropTypes.bool.isRequired,
		 className: React.PropTypes.string,
		 onChange: React.PropTypes.func
	};

	return ToggleSwitch;
};
