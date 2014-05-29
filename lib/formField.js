module.exports = function formField(label, type, id, value) {
	var input = "", labelEl, inp;

	switch(type) {
		case 'area':
			input = $('<textarea>').attr({'id': id , 'name':id}).val(value);
			break;

		case 'text':
			input = $('<input>').attr({'type': 'text', 'id': id, 'name': id}).val(value);
			break;


			// formField("Languages", "checks", [["zh", "Block chinese swear words"], ["en", "es"]);

		case 'checks':
			var checksDiv = $('<div>');
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					inp = $("<div>").addClass('check-item').append(
						$("<input>").attr({
							type: 'checkbox',
							id: id[i][0],
							name: id[i][0],
							checked: (value.indexOf(id[i][0]) != -1)
						}),
						$("<label>").attr('for', id[i][0]).text(id[i][1])
					);

					checksDiv.append(inp);
				}
				input = checksDiv;
			}
			break;

		//

		case 'radio':
			var radioDiv = $('<div>');
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					var checked = id[i][2] || "";

					input = $("<div class='radio-item'><input " + checked + " type='radio' id='" + id[i][0] + "' name='" + id[i][0] + "'/><label for='" + id[i][0] +"'>" + id[i][1] + "</label></div>");
					radioDiv.append(input);
				}
				input = radioDiv;

			}
			break;

		case 'toggle':
			input = $("<div>").append(
				$("<input>").addClass("switch").attr({
					type: 'checkbox',
					id: id,
					name: id
				}),
				$("<label>").attr("for", id).text(label);
			);
			break;

		case 'multientry':
			input = $("<span class='entry multientry' id='" + id + "'><span contenteditable class='item'></span></span>");
			lace.multientry.init();
			break;
	}

	var div = $('<div>').addClass('settings-item');
	var divLabel = $('<div>').addClass('settings-label').text(label);
	var divAction = $('<div>').addClass('settings-action');
	divAction.append(input);
	div.append(divLabel);
	div.append(divAction);
	return div;

	// return "<div class='settings-item'><div class='settings-label'>" + label + "</div><div class='settings-action'>" + input + "</div></div>";
};
