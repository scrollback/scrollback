"use strict";

module.exports = function() {
	const React = require("react");

	class ToggleGroup extends React.Component {
		constructor(props) {
			super(props);

			this.state = {
				value: this.props.value
			};
		}

		onChange(e) {
			let value = e.target.value;
			this.setState({ value }, () => typeof this.props.onUpdate === "function" ? this.props.onUpdate(value) : null);
		}

		get value() {
			return this.state.value;
		}

		componentWillReceiveProps(nextProps) {
			this.setState({ value: nextProps.value });
		}

		render() {
			return (
				<div {...this.props}>
					{this.props.items.map(item => {
						return (
							<label key={item.value}>
								<input
									type="radio"
									checked={this.state.value === item.value}
									disabled={item.disabled}
									value={item.value}
									name={this.props.name}
									onChange={this.onChange.bind(this)}
								/>
								<span>{item.label}</span>
							</label>
						);
					})}
				</div>
			);
		}
	}

	ToggleGroup.propTypes = {
		name: React.PropTypes.string.isRequired,
		value: React.PropTypes.string.isRequired,
		items: React.PropTypes.arrayOf(React.PropTypes.shape({
			value: React.PropTypes.string.isRequired,
			label: React.PropTypes.string.isRequired,
			checked: React.PropTypes.bool,
			disabled: React.PropTypes.bool,
			required: React.PropTypes.bool
		})).isRequired,
		onUpdate: React.PropTypes.func
	};

	return ToggleGroup;
};
