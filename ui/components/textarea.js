/* jshint browser: true */

module.exports = function() {
	var React = require("react"),
		TextArea;

	TextArea = React.createClass({
		focus: function() {
			var textBox = React.findDOMNode(this.refs.textBox),
				value;

			value  = textBox.value;

			textBox.focus();
			textBox.value = "";
			textBox.value = value;
		},

		val: function(value) {
			var textBox = React.findDOMNode(this.refs.textBox);

			if (typeof value === "string") {
				textBox.value = value;
			} else {
				return textBox.value;
			}
		},

		onInput: function(e) {
			var contentBox = React.findDOMNode(this.refs.contentBox);

			contentBox.innerText = contentBox.textContent = e.target.value;

			if (typeof this.props.onInput === "function") {
				this.props.onInput(e);
			}
		},

		render: function() {
			return (
			        <div className="textarea-container">
						<pre className={this.props.className}><span ref="contentBox"></span><br /></pre>
						<textarea ref="textBox" {...this.props} onInput={this.onInput}></textarea>
			        </div>
			        );
		}
	});

	return TextArea;
};
