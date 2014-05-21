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
					// input += "<input type='checkbox' id='" + id[i][0] + "' name='" + id[i][0] + "'><label for='" + id[i][0] +"'>" + id[i][1] + "</label>";
					inp = $('<input>').attr({'type':'checkbox', 'id': id[i][0], 'name': id[i][0]});
					checksDiv.append(inp);
				}
			} else {
				// input = "<input type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'>" + label + "</label>";
				input = $('<input>').attr({'type':'checkbox', 'id':id, 'name':id});
				labelEl = $('<label>').attr({'for': id}).text(label);
				input = $('<div>').append(input).append(labelEl);
			}
			break;

		case 'radio':
			var radioDiv = $('<div>');
			if (id instanceof Array) {
				for (var i = 0; i < id.length; i++) {
					// input += "<input " + id[i][2] + " type='radio' id='" + id[i][0] + "' name='" + id[i][0] + "'/><label for='" + id[i][0] +"'>" + id[i][1] + "</label>";
					var current = id[i][2];
					inp = $('<input>').attr({current : '', 'type': 'radio', 'id': id[i][0], 'name': id[i][0]} );
					radioDiv.append(inp); 
				}

			} else {
				// input = "<input type='radio' id='" + id + "' name='" + id + "'/><label for='" + id +"'>" + label + "</label>";
				input = $('<input>').attr({'type': 'radio', 'id': id, 'name': id});
			}
			break;

		case 'toggle':
			// input = "<input class='switch' type='checkbox' id='" + id + "' name='" + id + "'><label for='" + id +"'></label>";
			input = $('<input>').addClass('switch').attr({'type':'checkbox', 'id': id, 'name': id});
			labelEl = $('<label>').attr({'for': id, });
			inputDiv = $('<div>').append(input).append(labelEl);
			input = inputDiv;

			break;

		case 'segmented':
			// input = "<span class='entry segmented' id='" + id + "'><span contenteditable class='segment'></span></span>";
			var spanOuter = $('<span>').addClass('entry segmented').attr({'id': id});
			var spanInner = $('<span>').addClass('segment').attr({'contenteditable': ''});
			input = spanOuter.append(spanInner);
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