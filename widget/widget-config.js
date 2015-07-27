/* jshint browser: true */
/* global $ */
"use strict";

var formField = require("../ui/utils/form-field.js"),
	stringUtils = require("../lib/string-utils.js"),
	embedForm, startMinimized, titlebarColor;

module.exports = function(core, config, store) {
	function getEmbedCode() {
		var code = '<script>window.scrollback = %s;(function(d,s,h,e){e=d.createElement(s);e.async=1;e.src=(location.protocol === "https:" ? "https:" : "http:") + "//' + window.location.host + '/client.min.js";d.getElementsByTagName(s)[0].parentNode.appendChild(e);}(document,"script"));</script>',
			embedObj = {
				room: store.get("nav", "room"),
				titlebarColor: titlebarColor,
				form: embedForm,
				minimize: startMinimized
			};

		return stringUtils.format(code, JSON.stringify(embedObj));
	}

	function getMailToLink() {
		return "mailto:?body=" + encodeURIComponent(getEmbedCode()) + "&subject=" + encodeURIComponent("Embed Code for room: " + store.get("nav", "room"));
	}

	core.on("conf-show", function(conf, next) {
		var roomURL = "https://" + window.location.host + "/" + store.get("nav", "room"),
			$config, $roomURLField, $shareDiv, $qrCode,
			$titlebarColor,
			$formOptions, $minimizeOptions, $embedCode, $embedCodeDiv;

		if (!conf.room.guides) {
			conf.room.guides = {};
		}

		if (!conf.room.guides.allowedDomains) {
			conf.room.guides.llowedDomains = [];
		}

		// Set default embed options
		embedForm = "toast";
		startMinimized = false;

		$roomURLField = $("<input>").addClass("embed-input-url").attr({
			readonly: true,
			type: "url"
		}).val(roomURL).on("click", function() {
			$(this).select();
		});

		$config = $("<div>").append(formField("Room URL", "", "embed-room-url", $roomURLField));

		// Share buttons
		$shareDiv = $("<div>").addClass("embed-share").append(
			$("<a>").attr({
				href: "https://plus.google.com/share?url=" + roomURL,
				target: "_blank"
			}).addClass("button googleplus embed-share-button").text("Google+"),

			$("<a>").attr({
				href: "https://www.facebook.com/sharer/sharer.php?u=" + roomURL,
				target: "_blank"
			}).addClass("button facebook embed-share-button").text("Facebook"),

			$("<a>").attr({
				href: "https://twitter.com/intent/tweet?url=" + roomURL,
				target: "_blank"
			}).addClass("button twitter embed-share-button").text("Twitter")
		);
		$config.append(
			formField("List of domain names where this room can be embedded. (Leave empty to allow embedding anywhere.)", "area", "domain-list", (conf.room.guides && conf.room.guides.allowedDomains) ? conf.room.guides.allowedDomains.join("\n") : "")
		);
		$config.append(formField("Share room on", "", "share-embed", $shareDiv));

		// Qr code
		$qrCode = $("<img>").attr("src", "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=http://sb.lk/" + store.get("nav", "room"));

		$config.append(formField("QR code", "", "embed-qr-code", $qrCode));

		// Embed customization
		$config.append($("<h3>").text("Embed options"));

		// Titlebar color
		$titlebarColor = formField("Titlebar background color", "text", "embed-titlebar-color", "");

		$titlebarColor.find("input").attr({
			type: "color",
			placeholder: "#33ccaa"
		}).on("keydown paste input change", function() {
			var $input = $(this);

			titlebarColor = $input.val() || "";

			titlebarColor.toLowerCase();

			if (/(^#[0-9a-f]{6}$)|(^#[0-9a-f]{3}$)/i.test(titlebarColor)) {
				$embedCode.text(getEmbedCode());
				$input.removeClass("error");
			} else {
				$input.addClass("error");
			}

		});

		$config.append($titlebarColor);

		// Widget minimize
		$minimizeOptions = formField("Start widget minimized", "check", "embed-minimized-check", [["", "", startMinimized]]);

		$minimizeOptions.find("[name='embed-minimized-check']").on("change", function() {
			startMinimized = $(this).is(":checked");

			$embedCode.text(getEmbedCode());
		});

		$config.append($minimizeOptions);

		// Widget form
		$formOptions = formField("Widget appearance", "radio", "embed-form-options", [["embed-form-toast", "Toast", true], ["embed-form-canvas", "Canvas"]]);

		$formOptions.find("[name='embed-form-options']").on("change", function() {
			embedForm = $("[name='embed-form-options']:checked").attr("id");

			embedForm = (typeof embedForm === "string" && embedForm.length > 11) ? embedForm.toLowerCase().substring(11) : "toast";

			$embedCode.text(getEmbedCode());
		});

		$config.append($formOptions);

		$embedCode = $("<textarea>").addClass("embed-code").attr("readonly", true).text(getEmbedCode()).on("click", function() {
			this.select();
		});

		// Embed code
		$embedCodeDiv = $("<div>").append(
			$("<p>").text("Place the following code just before the closing '</head>' tag."),
			$embedCode,
			$("<p>").append(
				$("<a>").attr({
					href: getMailToLink(),
					target: "_blank"
				}).addClass("button secondary").text("Email to developer")
			),
			$("<p>").append(
				$("<a>").attr({
					href: "https://github.com/scrollback/scrollback/wiki/Embed-Options",
					target: "_blank"
				}).text("Know more about Embed options")
			)
		);

		$config.append(formField("Embed code", "", "embed-code", $embedCodeDiv));

		conf.embed = {
			text: "Share & Embed",
			html: $config
		};

		next();
	}, 400);

	core.on("conf-save", function(room, next) {
		var domains = $("#domain-list").val();
		if (!room.guides) {
			room.guides = {};
		}
		
		room.guides.allowedDomains = [];
		
		domains = domains.split("\n");
	    domains.forEach(function(e) {
	        if (e.trim()) {
				room.guides.allowedDomains.push(e.trim());
	        }
	    });
		next();
	}, 500);
};
