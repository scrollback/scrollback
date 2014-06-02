/* jshint browser: true */
/* global $, lace */

module.exports = function formField(label, type, id, value) {
	var input = "",
		inputEl,
		i;

	switch(type) {
		case 'area':
			input = $('<textarea>').attr({'id': id , 'name':id}).val(value);

			break;

		case 'text':
			input = $('<input>').attr({'type': 'text', 'id': id, 'name': id}).val(value);

			break;

		case 'check':
			input = $('<div>');

			if (id instanceof Array) {
				for (i = 0; i < id.length; i++) {
					inputEl = $("<div>").addClass("check-item").append(
						$("<input>").attr({
							type: "checkbox",
							id: id[i][0],
							name: id[i][0],
							checked: (value.indexOf(id[i][0]) != -1)
						}),
						$("<label>").attr({"for": id[i][0]}).text(id[i][1])
					);

					input.append(inputEl);
				}
			}

			break;

		case 'radio':
			input = $('<div>');

			if (id instanceof Array) {
				for (i = 0; i < id.length; i++) {
					inputEl = $("<div>").addClass("radio-item").append(
						$("<input>").attr({
							type: "radio",
							id: id[i][0],
							name: id[i][0],
							checked: (value.indexOf(id[i][0]) != -1)
						}),
						$("<label>").attr({"for": id[i][0]}).text(id[i][1])
					);

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
