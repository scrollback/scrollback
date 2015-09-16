"use strict";

module.exports = function() {
	const React = require("react"),
		  ReactDOM = require("react-dom");

	class TextArea extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.onInput = this.onInput.bind(this);
		}

		focus() {
			return ReactDOM.findDOMNode(this.refs.textBox).focus();
		}

		val(value) {
			var contentBox = ReactDOM.findDOMNode(this.refs.contentBox),
				textBox = ReactDOM.findDOMNode(this.refs.textBox);

			if (typeof value === "string") {
				contentBox.textContent = textBox.value = value;
			} else {
				return textBox.value;
			}
		}

		area() {
			return ReactDOM.findDOMNode(this.refs.textBox);
		}

		onInput(e) {
			var contentBox = ReactDOM.findDOMNode(this.refs.contentBox);

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
