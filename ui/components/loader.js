"use strict";

module.exports = () => {
	const React = require("react");

	class Loader extends React.Component {
		constructor(props) {
			super(props);
		}

		render() {
			let radius = 16,
				size = radius * 2;

			return (
				<svg className={"loader " + this.props.status} height={size} width={size}>
					<circle cx={radius} cy={radius} r={radius - 2} strokeWidth="2"/>
					<path className="check" d="M6,11.2 L1.8,7 L0.4,8.4 L6,14 L18,2 L16.6,0.6 L6,11.2 Z" transform="translate(25, 23) rotate(180)" />
					<path className="warn" d="M0,19 L22,19 L11,0 L0,19 L0,19 Z M12,16 L10,16 L10,14 L12,14 L12,16 L12,16 Z M12,12 L10,12 L10,8 L12,8 L12,12 L12,12 Z" transform="translate(27, 28) rotate(180)" />
				</svg>
			);
		}
	}

	Loader.propTypes = {
		status: React.PropTypes.string
	};

	return Loader;
};
