"use strict";

module.exports = function(core, config, store) {
	const React = require("react");

	class ScrollTo extends React.Components {
		constructor(props) {
			super(props);

			this.state = { show: false };
		}

		render() {
			var className = "scroll-to scroll-to-" + this.props.type + " " + (this.props.className || "");

			if (this.state.show) {
				className += " visible";
			}

			return <div {...this.props} className={className}></div>;
		}

		onStateChange(changes) {
			if (changes.nav) {
				if (this.props.type === "top" && "threadRange" in changes.nav)  {
					this.setState({ show: store.get("nav", "threadRange", "time") });
				} else if (this.props.type === "bottom" && "textRange" in changes.nav) {
					this.setState({ show: store.get("nav", "textRange", "time") });
				} else {
					this.setState({ show: false });
				}
			}
		}

		componentDidMount() {
			this.stateChangeHandler = this.onStateChange.bind(this);

			core.on("statechange", this.stateChangeHandler, 100);
		}

		componentWillUnmount() {
			core.off("statechange", this.stateChangeHandler);
		}
	}

	ScrollTo.propTypes = {
		type: React.PropTypes.string.isRequired,
		className: React.PropTypes.string
	};

	return ScrollTo;
};
