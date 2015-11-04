/* eslint-env browser */

"use strict";

const React = require("react"),
	  timeUtils = require("../lib/time-utils");

module.exports = (core, ...args) => {
	const NotificationItem = require("./notification-item.js")(core, ...args);

	class NotificationCenterItem extends React.Component {
		constructor(props) {
			super(props);

			this.state = { item: new NotificationItem(props.note) };
		}

		closeItem(e) {
			let parent = e.target.parentNode;

			parent.className += " out";

			setTimeout(() => {
				parent.style.display = "none";

				this.state.item.dismiss();
			}, 300);
		}

		render() {
			let item = this.state.item,
				actions = [];

			for (let handler of item.handlers) {
				if (handler.label === "default") {
					continue;
				}

				if (typeof handler.action === "function") {
					actions.push(
								 <a className={handler.label.toLowerCase().replace(/\s+/, "-")} onClick={handler.action.bind(handler)}>
									{handler.label}
								 </a>
								 );
				}
			}

			return (
				   <div className={"notification-center-item item " + this.props.note.noteType + (typeof item.readTime === "number" ? " read" : "")}>
					<span className="notification-center-item-close close" onClick={this.closeItem.bind(this)} />
					<span className="notification-center-item-content content" onClick={item.act.bind(item)}>
						<span className="notification-center-item-text" dangerouslySetInnerHTML={{__html: item.html}}/>
						<span className="notification-center-item-timestamp">{timeUtils.long(this.props.note.time)}</span>
					</span>
					<span className="notification-center-item-actions">{actions}</span>
				   </div>
				   );
		}
	}

	NotificationCenterItem.propTypes = {
		note: React.PropTypes.shape({
			noteType: React.PropTypes.string,
			time: React.PropTypes.number
		})
	};

	return NotificationCenterItem;
};
