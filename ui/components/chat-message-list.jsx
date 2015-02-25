/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ChatItem = require("./chat-item.jsx")(core, config, store),
		ChatMessageList,
		chatmessagelistEl = document.getElementById("js-chat-area-input");

	ChatMessageList = React.createClass({
		render: function() {
			return (
		        <div key="chat-area-input" className="chat-area-input-inner">
		        	<div contentEditable autoFocus dangerouslySetInnerHTML={{__html: this.state.userInput}}
		        		 onPaste={this.onPaste} onBlur={this.onBlur} onKeyDown={this.onKeyDown} onInput={this.setPlaceHolder}
		        		 ref="composeBox" tabIndex="1" className="chat-area-input-entry">
		        	</div>
		        	<div ref="composePlaceholder" className="chat-area-input-placeholder"></div>
		            <div className="chat-area-input-send" onClick={this.sendMessage}></div>
		        </div>
	        );
		}
	});

	core.on("statechange", function(changes, next) {
		// React.render(<ChatMessageList />, chatmessagelistEl);

		next();
	}, 500);

	return ChatMessageList;
};
