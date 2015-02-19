/* jshint browser: true */

module.exports = function(core, config, state) {
	var React = require("react"),
		ThreadCard;

	ThreadCard = React.createClass({
		goToThread: function() {
			core.emit("setstate", {
				nav: {
					thread: this.props.thread.id,
					mode: "chat",
					view: null
				}
			});
		},

		render: function() {
			var thread = this.props.thread,
			  	chats;

			chats = (state.getTexts(this.props.roomId, thread.id, null, ((this.props.textCount || 3) * -1)) || []).reverse().map(function(chat) {
				if (typeof chat === "object" && typeof chat.text === "string") {
					return (
				        <div key={"thread-card-chat-" + thread.id + "-" + chat.id} className="card-chat">
							<span className="card-chat-nick">{chat.from}</span>
							<span className="card-chat-message">{chat.text}</span>
						</div>
					);
				}
			});

			return (
			    <div  key={"thread-card-" + thread.id} className="card thread-card" data-color={thread.color} onClick={this.goToThread}>
			    	<div className="card-header">
			    		<h3 className="card-header-title">{thread.title}</h3>
		      			<span className="card-header-badge notification-badge notification-badge-mention">{thread.mentions}</span>
		      			<span className="card-header-badge notification-badge notification-badge-messages">{thread.messages}</span>
			    		<a className="card-header-icon card-header-icon-more"></a>
		    		</div>
	    			<div className="card-content">{chats}</div>
					<div className="card-quick-reply js-quick-reply">
						<div className="card-quick-reply-content">
							<div className="card-button card-button-reply">Quick reply</div>
							<input type="text" className="card-entry card-entry-reply js-quick-reply-entry" />
						</div>
					</div>
				</div>
			);
		}
	});

	return ThreadCard;
};
