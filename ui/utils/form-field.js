/* eslint-env browser */
/* global $ */

"use strict";

var formField = function(label, type, id, value) {
	var $input, i;

	switch (type) {
		case "area":
			$input = $("<textarea>").attr({
				"id": id,
				"name": id
			}).val(value);

			break;

		case "text":
			$input = $("<input>").attr({
				"type": "text",
				"id": id,
				"name": id
			}).val(value);

			break;

		case "check":
			$input = $("<div>");

			if (value instanceof Array) {
				for (i = 0; i < value.length; i++) {
					$("<div>").addClass("check-item").append($("<input>").attr({
							type: "checkbox",
							id: value[i][0],
							value: value[i][0],
							name: id,
							checked: (value[i][2] === true)
						}),
						$("<label>").attr({
							"for": value[i][0]
						}).text(value[i][1])
					).appendTo($input);
				}
			}

			break;

		case "radio":
			$input = $("<div>");

			if (value instanceof Array) {
				for (i = 0; i < value.length; i++) {
					$("<div>").addClass("radio-item").append($("<input>").attr({
							type: "radio",
							id: value[i][0],
							value: value[i][0],
							name: id,
							checked: (value[i][2] === true)
						}),
						$("<label>").attr({
							"for": value[i][0]
						}).text(value[i][1])
					).appendTo($input);
				}
			}

			break;

		case "toggle":
			$input = $("<div>").addClass("switch-container").append(
				$("<input>").addClass("switch").attr({
					type: "checkbox",
					id: id,
					name: id,
					checked: value
				}),
				$("<label>").attr({
					"for": id
				})
			);

			break;

		case "multientry":
			$input = $.multientry("create").multientry("add", value).attr({ "id": id });

			break;

		case "info":
			$input = $("<p>").attr({ "id": id }).addClass("tip info").text(value);

			break;

		case "success":
			$input = $("<p>").attr({ "id": id }).addClass("tip success").text(value);

			break;

		case "warning":
			$input = $("<p>").attr({ "id": id }).addClass("tip warning").text(value);

			break;

		case "error":
			$input = $("<p>").attr({ "id": id }).addClass("tip error").text(value);

			break;

		default:
			$input = $("<div>").attr({ "id": id }).html(value);

			break;
	}

	return $("<div>").addClass("settings-item").append(
		$("<div>").addClass("settings-label").text(label),
		$("<div>").addClass("settings-action").append($input)
	);
};

module.exports = formField;
