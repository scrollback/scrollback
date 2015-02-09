var React = require("react"),
	GridView;

/**
 * GridView component.
 *
 * {
 * 	sections: [
 * 		{
 * 			header: "Some header"
 * 			items: [ ... ]
 * 		},
 * 		{
 * 			header: "Another header"
 * 			items: [ ... ]
 * 		}
 * 	]
 * }
 */

GridView = React.createClass({displayName: "GridView",
	render: function() {
		var sections = this.props.sections,
			gridview = [],
			items;

		for (var i = 0, l = sections.length; i < l; i++) {
			if (sections[i].header) {
				gridview.push(React.createElement("h3", {className: "grid-header"}, sections[i].header));
			}

			if (sections[i].items) {
				items = [];

				for (var j = 0, m = sections.items.length; j < m; j++) {
					items.push(React.createElement("li", {className: "grid-item"}, sections.items[i]));
				}

				gridview.push(React.createElement("ul", {className: "grid-section"}, items));
			}
		}

		return (React.createElement("div", {className: "grid-view"}, gridview));
	}
});
