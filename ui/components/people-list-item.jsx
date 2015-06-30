"use strict";

var getAvatar = require("../../lib/get-avatar.js"),
	showMenu = require("../utils/show-menu.js"),
	appUtils = require("../../lib/app-utils.js");

module.exports = function(core, config, store) {
	var React = require("react"),
		PeopleListItem;

	PeopleListItem = React.createClass({
		showPeopleMenu: function(e) {
			core.emit("people-menu", {
				origin: e.currentTarget,
				buttons: {},
				items: {},
				arrow: true,
				user: this.props.user
			}, function(err, menu) {
				showMenu("people-menu", menu);
			});
		},
		render: function() {
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
					<span className="people-list-item-nick">{appUtils.formatUserName(this.props.user.id)}</span>
					{role ? <span className="people-list-item-role">{role}</span> : ""}
				</div>
			);
		}
	});

	return PeopleListItem;
};
