/* eslint-env es6, browser */

"use strict";

const format = require("../../lib/format.js"),
	  userUtils = require("../../lib/user-utils.js"),
	  showMenu = require("../utils/show-menu.js");

module.exports = (core, config, store) => {
	const React = require("react"),
		  Badge = require("./badge.jsx")(core, config, store);

	class ThreadCard extends React.Component {
		constructor(props) {
			super(props);

			this.state = { texts: this.getTexts(this.props) };
		}

		getTexts(props) {
			return (store.getTexts(props.roomId, props.thread.id, null, -4) || []).filter(text => text.from && text.text);
		}

		goToThread(e) {
			e.preventDefault();

			core.emit("setstate", {
				nav: {
					thread: this.props.thread.id,
					mode: "chat",
					view: null
				}
			});
		}

		showThreadMenu(e) {
			core.emit("thread-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {},
				threadObj: this.props.thread
			}, (err, menu) => {
				if (err) {
					return;
				}

				showMenu("thread-menu", menu);
			});
		}

		shareThread() {
			// Life would be easier if we had a function to convert a state object to URL
			let url = window.location.protocol + "//" + window.location.host + "/" + store.get("nav", "room") + "/" + this.props.thread.id,
				text = "Let's talk about " + this.props.thread.title;

			if (window.Android && typeof window.Android.shareItem === "function") {
				window.Android.shareItem("Share discussion via", text + " - " + url);

				return;
			}

			core.emit("setstate", {
				nav: {
					dialog: "share",
					dialogState: {
						shareText: text,
						shareUrl: url,
						shareType: "discussion"
					}
				}
			});
		}

		badgeFilter(note) {
			return note.group.split("/")[1] === this.props.thread.id;
		}

		componentWillReceiveProps(nextProps) {
			this.setState({ texts: this.getTexts(nextProps) });
		}

		render() {
			const { thread } = this.props;

			return (
				<div
					key={"thread-card-" + thread.id}
					className={"card card-thread" + (Array.isArray(thread.tags) ? thread.tags.map(t => " card-tag-" + t).join("") : "")}>
					<div className="card-actions">
						<Badge className="card-actions-item card-badge notification-badge" filter={this.badgeFilter.bind(this)} />
						{thread.tags && thread.tags.indexOf("thread-hidden") > -1 ?
							null :
							<span className="card-actions-item card-icon card-icon-share" onClick={this.shareThread.bind(this)}></span>
						}
						<span data-role="owner moderator" className="card-actions-item card-icon card-icon-more" onClick={this.showThreadMenu.bind(this)}></span>
					</div>
					<div className="card-content" onClick={this.goToThread.bind(this)}>
						<h3 className={"color-" + thread.color}>{thread.title}</h3>
						{this.state.texts.reverse().map(text => {
							return (
								<div key={"thread-text-" + text.id}>
									<div className="nick">{userUtils.getNick(text.from)}</div>
									<div className="text markdown-text" dangerouslySetInnerHTML={{__html: format.mdToHtml(text.text)}} />
								</div>
							);
						})}
					</div>
					<div className="card-bottom" onClick={this.goToThread.bind(this)}>
						<span className="card-bottom-icon card-icon-people">{thread.concerns ? thread.concerns.length : 0} people talking</span>
					</div>
				</div>
			);
		}
	}

	ThreadCard.propTypes = {
		roomId: React.PropTypes.string,
		thread: React.PropTypes.shape({
			id: React.PropTypes.string.isRequired,
			title: React.PropTypes.string.isRequired,
			color: React.PropTypes.number,
			concerns: React.PropTypes.arrayOf(React.PropTypes.string),
			tags: React.PropTypes.arrayOf(React.PropTypes.string),
			updateTime: React.PropTypes.number.isRequired
		})
	};

	return ThreadCard;
};
