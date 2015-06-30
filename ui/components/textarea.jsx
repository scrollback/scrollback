"use strict";

module.exports = function() {
	var React = require("react"),
		TextArea;

	TextArea = React.createClass({
		focus: function() {
			return React.findDOMNode(this.refs.textBox).focus();
		},

		val: function(value) {
			var contentBox = React.findDOMNode(this.refs.contentBox),
				textBox = React.findDOMNode(this.refs.textBox);

			if (typeof value === "string") {
				contentBox.textContent = textBox.value = value;
			} else {
				return textBox.value;
			}
		},

		area: function() {
			return React.findDOMNode(this.refs.textBox);
		},

		onInput: function(e) {
			var contentBox = React.findDOMNode(this.refs.contentBox);

			contentBox.textContent = e.target.value;

			if (typeof this.props.onInput === "function") {
				this.props.onInput(e);
			}
		},

		render: function() {
			return (
			        <div className="textarea-container">
						<pre className={this.props.className}><span ref="contentBox" /><br /></pre>
						<textarea ref="textBox" {...this.props} onInput={this.onInput} />
			        </div>
			        );
		},

		shouldComponentUpdate: function(nextProps) {
			for (let prop in nextProps) {
				if (nextProps[prop] && nextProps[prop] !== this.props[prop]) {
					return true;
				}
			}

			return false;
		}
	});

	return TextArea;
};
