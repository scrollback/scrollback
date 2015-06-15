/* eslint-env es6, browser */

"use strict";

const React = require("react");

module.exports = (core, ...args) => {
	const NotificationItem = require("./notification-item.es6")(core, ...args);

	class NotificationCenterItem extends React.Component {
		constructor(props) {
			super(props);

			this.state = { item: new NotificationItem(props.note) };
		}

		closeItem(e) {
			let parent = e.target.parentNode;

			parent.className += " out";

			setTimeout(() => parent.style.display = "none", 300);

			this.state.item.dismiss();
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
				   <div className={"notification-center-item item" + (typeof item.readTime === "number" ? " read" : "")}>
					<span className="notification-center-item-close close" onClick={this.closeItem.bind(this)} />
					<span
						className="notification-center-item-content content"
						dangerouslySetInnerHTML={{__html: item.html}}
						onClick={item.act.bind(item)}
						/>
					<span className="notification-center-item-actions">{actions}</span>
				   </div>
				   );
		}
	}

	return NotificationCenterItem;
};
