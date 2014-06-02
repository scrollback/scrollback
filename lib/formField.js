/* jshint browser: true */
/* global $, lace */

module.exports = function formField(label, type, id, value) {
	var input = "",
		inputEl,
		i, inputItem, inputLabel;

	switch(type) {
		case 'area':
			input = $('<textarea>').attr({'id': id , 'name':id}).val(value);

			break;

		case 'text':
			input = $('<input>').attr({'type': 'text', 'id': id, 'name': id}).val(value);

			break;

		case 'check':
			input = $('<div>');

			if (value instanceof Array) {
				for (i = 0; i < value.length; i++) {
					inputItem = $("<input>").attr({
						type: "checkbox",
						id: value[i][0],
						value: value[i][0],
						name: id
					});
					if(value[i].contains('checked')){
						inputItem.attr('checked', true);
					}
					inputLabel = $("<label>").attr({"for": value[i][0]}).text(value[i][1]);
					inputEl = $("<div>").addClass("check-item").append(inputItem, inputLabel);

					input.append(inputEl);
				}
			}

			break;

		case 'radio':
			input = $('<div>');

			if (value instanceof Array) {
				for (i = 0; i < value.length; i++) {
					inputItem = $("<input>").attr({
						type: "radio",
						id: value[i][0],
						value: value[i][0],
						name: id
					});
					if(value[i].contains('checked')){
						inputItem.attr('checked', true);
					}
					inputLabel = $("<label>").attr({"for": value[i][0]}).text(value[i][1]);
					inputEl = $("<div>").addClass("radio-item").append(inputItem, inputLabel);
					input.append(inputEl);
				}
			}

			break;

		case 'toggle':
			input = $("<div>").append(
				$("<input>").addClass("switch").attr({
					type: "checkbox",
					id: id,
					name: id,
					checked: value
				}),
				$("<label>").attr({"for": id})
			);

			break;

		case 'multientry':
			input = lace.multientry.create().attr({"id": id});

			if (value) {
				lace.multientry.add(input, value);
			}

			break;
	}

	var div = $('<div>').addClass('settings-item').append(
		$('<div>').addClass('settings-label').text(label),
		$('<div>').addClass('settings-action').append(input)
	);

	return div;

};
