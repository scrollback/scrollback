"use strict";

var getAvatar = require("../../lib/get-avatar.js"),
	showMenu = require("../utils/show-menu.js"),
	userUtils = require("../../lib/user-utils.js");

module.exports = function(core, config, store) {
	var React = require("react");

	class PeopleListItem extends React.Component {
		constructor(props, context) {
			super(props, context);
			this.showPeopleMenu = this.showPeopleMenu.bind(this);
		}

		showPeopleMenu(e) {
			core.emit("people-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {},
				arrow: true,
				user: this.props.user
			}, function(err, menu) {
				showMenu("people-menu", menu);
			});
		}

		render() {
			let rel = store.getRelation(store.get("nav","room"), this.props.user.id), role;
			if (rel.role === "owner") {
				role = "owner";
			} else if (rel.role === "moderator") {
				role = "mod";
			} else if (rel.role === "banned") {
				role = "banned";
			} else {
				role = null;
			}

			return (
			<div className="people-list-item" onClick={this.showPeopleMenu}>
					<img className="people-list-item-avatar" src={getAvatar(this.props.user.picture, 48)} />
					<span className="people-list-item-nick">{userUtils.getNick(this.props.user.id)}</span>
					{role ? <span className="people-list-item-role">{role}</span> : ""}
				</div>
			);
		}
	}

	return PeopleListItem;
};
