module.exports = function() {
	var React = require("react"),
		Endless = require("../../bower_components/endless/endless.js"),
		GridView;

	/**
	 * GridView component.
	 *
	 * sections: [
	 * 	{
	 * 		key: "somekey",
	 * 		header: "Some header",
	 * 		items: [{
	 * 			key: "somekey"
	 * 			elem: reactelem
	 * 		}]
	 * 	},
	 * 	{
	 * 		key: "otherkey",
	 * 		header: "Another header"
	 * 		items: [{
	 * 			key: "somekey"
	 * 			elem: reactelem
	 * 		}]
	 * 	}
	 * ]
	 *
	 * endless: false
	 */

	GridView = React.createClass({
		render: function() {
			var sections = this.props.sections,
				gridview = [],
				content, items, key;

			for (var i = 0, l = sections.length; i < l; i++) {
				if (sections[i].header) {
					gridview.push(<h3 key={"header-" + sections[i].key} className="grid-header">{sections[i].header}</h3>);
				}

				if (sections[i].items) {
					items = [];

					for (var j = 0, m = sections[i].items.length; j < m; j++) {
						key = sections[i].items[j].key + (sections[i].items[j].elem.key ? "-" + sections[i].items[j].elem.key : "");

						items.push(<li key={key} className="grid-item" tabIndex="1">{sections[i].items[j].elem}</li>);
					}

					if (sections[i].endless) {
						content = <Endless key={this.props.endlesskey} items={items} onScroll={this.props.onScroll}
							atTop={sections[i].atTop} atBottom={sections[i].atBottom} position={sections[i].position}/>;
					} else {
						content = items;
					}

					gridview.push(<ul key={"section-" + sections[i].key} className="grid-section">{content}</ul>);
				}
			}

			return (<div className="grid-view">{gridview}</div>);
		}
	});

	return GridView;
};
