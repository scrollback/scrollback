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

GridView = React.createClass({
	render: function() {
		var sections = this.props.sections,
			gridview = [],
			items;

		for (var i = 0, l = sections.length; i < l; i++) {
			if (sections[i].header) {
				gridview.push(<h3 className="grid-header">{sections[i].header}</h3>);
			}

			if (sections[i].items) {
				items = [];

				for (var j = 0, m = sections.items.length; j < m; j++) {
					items.push(<li className="grid-item">{sections.items[i]}</li>);
				}

				gridview.push(<ul className="grid-section">{items}</ul>);
			}
		}

		return (<div className="grid-view">{gridview}</div>);
	}
});
