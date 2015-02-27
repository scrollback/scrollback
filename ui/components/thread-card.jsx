/* jshint browser: true */

module.exports = function(core, config, store) {
	var React = require("react"),
		ThreadCard;

	ThreadCard = React.createClass({
		getInitialState: function () {
			return { texts: (store.getTexts(this.props.roomId, this.props.thread.id, null, -(this.props.textCount || 3)) || []).reverse() };
		},

		componentDidMount: function () {
			var self = this;

			core.on("statechange", function(changes, next) {
				if (self.isMounted() && "texts" in changes) {
					self.replaceState(self.getInitialState());
				}

				next();
			}, 500);
		},

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

			chats = this.state.texts.map(function(chat) {
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
