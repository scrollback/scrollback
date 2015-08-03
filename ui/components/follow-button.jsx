/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react");

	class FollowButton extends React.Component {
		constructor(props) {
			super(props);

			this.state = this.buildState();
		}

		buildState() {
			let rel = store.getRelation(this.props.room);

			return {
				role: store.getUserRole(this.props.user, this.props.room),
				requested: (rel && rel.transitionRole === "follower" && rel.transitionType === "request")
			};
		}

		toggle() {
			const room = this.props.room || store.get("nav", "room");

			if (this.state.role === "follower") {
				core.emit("part-up",  { to: room });
			} else {
				core.emit("join-up",  { to: room });
			}
		}

		onClick(e) {
			this.toggle();

			if (typeof this.props.onClick === "function") {
				this.props.onClick(e);
			}
		}

		render() {
			let className = (this.props.className || "") + " is-" + this.state.role + (this.state.requested ? " requested" : "");

			return (
				<a {...this.props} onClick={this.onClick.bind(this)} className={className}>
					{this.props.children}
				</a>
			);
		}

		onStateChange(changes) {
			let user = this.props.user || store.get("user");

			if (changes.user || (changes.indexes && (changes.indexes.userRooms && changes.indexes.userRooms[user]))) {
				this.setState(this.buildState);
			}
		}

		componentDidMount() {
			this.changeListener = this.onStateChange.bind(this);

			core.on("statechange", this.changeListener, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.changeListener);
		}
	}

	return FollowButton;
};
