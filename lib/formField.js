module.exports = function formField(label, type, id) {
	var input = "";

	switch(type) {
		case 'area':
			input = "<textarea id='" + id + "' name='" + id + "'></textarea>";
			break;
		case 'text':
			input = "<input type='text' id='" + id + "' name='" + id + "'>";
			break;
		case 'checks':
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					input += "<input type='checkbox' id='" + id[i][0] + "' name='" + id[i][0] + "'><label for='" + id[i][0] +"'>" + id[i][1] + "</label>";
				}
			} else {
				input = "<input type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'>" + label + "</label>";
			}
			break;
		case 'radio':
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					input += "<input " + id[i][2] + " type='radio' id='" + id[i][0] + "' name='" + id[i][0] + "'/><label for='" + id[i][0] +"'>" + id[i][1] + "</label>";
				}

			} else {
				input = "<input type='radio' id='" + id + "' name='" + id + "'/><label for='" + id +"'>" + label + "</label>";
			}
			break;
		case 'toggle':
			input = "<input class='switch' type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'></label>";
			break;
		case 'segmented':
			input = "<span class='entry segmented' id='" + id + "'><span contenteditable class='segment'></span></span>";
			break;
	}

	return "<div class='settings-item'><div class='settings-label'>" + label + "</div><div class='settings-action'>" + input + "</div></div>";
};