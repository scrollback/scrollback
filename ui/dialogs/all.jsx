/* eslint-env es6, browser */

"use strict";

module.exports = (...args) => {
	const React = require("react"),
		  Share = require("./share.jsx")(...args);

	let ShareDialog = React.createClass({
		render: function() {
			return (
				<div className="dialogs">
					<Share />
				</div>
			);
		}
	});

	return ShareDialog;
};
