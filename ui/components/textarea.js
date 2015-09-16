"use strict";

module.exports = function() {
	var React = require("react");

	class TextArea extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.onInput = this.onInput.bind(this);
		}

		focus() {
			return React.findDOMNode(this.refs.textBox).focus();
		}

		val(value) {
			var contentBox = React.findDOMNode(this.refs.contentBox),
				textBox = React.findDOMNode(this.refs.textBox);

			if (typeof value === "string") {
				contentBox.textContent = textBox.value = value;
			} else {
				return textBox.value;
			}
		}

		area() {
			return React.findDOMNode(this.refs.textBox);
		}

		onInput(e) {
			var contentBox = React.findDOMNode(this.refs.contentBox);

			contentBox.textContent = e.target.value;

			if (typeof this.props.onInput === "function") {
				this.props.onInput(e);
			}
		}

		render() {
			return (
					<div className="textarea-container">
						<pre className={this.props.className}><span ref="contentBox" /><br /></pre>
						<textarea ref="textBox" {...this.props} onInput={this.onInput} />
					</div>
					);
		}
	}

	return TextArea;
};
