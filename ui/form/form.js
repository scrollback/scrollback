"use strict";

module.exports = () => {
	const React = require("react");

	class Form extends React.Component {
		constructor(props) {
			super(props);
		}

		onSubmit(e) {
			e.preventDefault();

			// Validate all childrens
			const count = React.Children.count(this.props.children);

			let isValid = true,
				promises = [];

			for (let i = 0; i < count; i++) {
				const input = this.refs["input-" + i];

				if (input && typeof input.validateField === "function") {
					let value = input.validateField();

					if (value) {
						if (typeof value === "object" && typeof value.then === "function" && typeof value.catch === "function") {
							promises.push(value);
						}
					} else {
						isValid = false;

						break;
					}
				}
			}

			if (isValid) {
				if (promises.length) {
					Promise.all(promises).then(results => {
						for (const r in results) {
							if (!r) {
								isValid = false;

								break;
							}
						}

						if (isValid) {
							if (typeof this.props.onSubmit === "function") {
								this.props.onSubmit(e);
							}
						}
					});
				} else {
					if (typeof this.props.onSubmit === "function") {
						this.props.onSubmit(e);
					}
				}
			}
		}

		render() {
			let i = 0;

			const children = React.Children.map(this.props.children, child => {
				return React.cloneElement(child, { ref: "input-" + (i++) });
			});

			return (
				<form {...this.props} onSubmit={this.onSubmit.bind(this)}>
					{children}
				</form>
			);
		}
	}

	Form.propTypes = {
		children: React.PropTypes.oneOfType([ React.PropTypes.element, React.PropTypes.arrayOf(React.PropTypes.element) ]).isRequired,
		onSubmit: React.PropTypes.func
	};

	return Form;
};
