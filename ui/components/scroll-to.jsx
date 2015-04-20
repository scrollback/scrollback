/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ScrollTo;

	ScrollTo = React.createClass({
		render: function() {
			var className = "scroll-to scroll-to-" + this.props.type + " " + this.props.className;

			if (this.state.show) {
				className += " visible";
			}

			return <div {...this.props} className={className}>{"Scroll to" + this.props.type}</div>;
		},

		getInitialState: function () {
		    return { show: false };
		},

		onStateChange: function(changes, next) {
			if (changes.nav) {
				if (this.props.type === "top" && "threadRange" in changes.nav)  {
					this.setState({ show: store.get("nav", "threadRange", "time") });
				} else if (this.props.type === "bottom" && "textRange" in changes.nav) {
					this.setState({ show: store.get("nav", "textRange", "time") });
				} else {
					this.setState(this.getInitialState());
				}
			}

			next();
		},

		componentDidMount: function() {
			core.on("statechange", this.onStateChange, 500);
		},

		componentWillUnmount: function() {
			core.off("statechange", this.onStateChange);
		}
	});

	return ScrollTo;
};
