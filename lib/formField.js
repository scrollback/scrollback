module.exports = function formField(label, type, id) {
	var input = "", labelEl, inp;

	switch(type) {
		case 'area':
			input = $('<textarea>').attr({'id': id , 'name':id});
			break;

		case 'text':
			input = $('<input>').attr({'type': 'text', 'id': id, 'name': id});
			break;

		case 'checks':
			var checksDiv = $('<div>');
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					input = $("<div class='check-item'><input type='checkbox' id='" + id[i][0] + "' name='" + id[i][0] + "'><label for='" + id[i][0] +"'>" + id[i][1] + "</label></div>");
					checksDiv.append(inp);
				}
				input = checksDiv;
			} else {
				input = $("<input type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'>" + label + "</label>");
			}
			break;

		case 'radio':
			var radioDiv = $('<div>');
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					var checked = id[i][2] || "";

					input = $("<div class='radio-item'><input " + checked + " type='radio' id='" + id[i][0] + "' name='" + id[i][0] + "'/><label for='" + id[i][0] +"'>" + id[i][1] + "</label></div>");
					radioDiv.append(input);
				}
				input = radioDiv;

			} else {
				input = $("<input type='radio' id='" + id + "' name='" + id + "'/><label for='" + id +"'>" + label + "</label>");
			}
			break;

		case 'toggle':
			input = $("<input class='switch' type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'></label>");
			break;

		case 'segmented':
			input = $("<span class='entry segmented' id='" + id + "'><span contenteditable class='segment'></span></span>");
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
