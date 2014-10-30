/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb, currentState, format */
var formField = require('../lib/formField.js');
libsb.on("config-show", function (conf, next) {
   //room URL
	var backgroundColor = "";
	var backgroundImage = "";
	var $div = $("<div>");
	var roomURL = "https://" + window.location.host + "/" + currentState.roomName;
	var $roomURLField = $("<input>").addClass("embed-input-url").attr("readonly", true).val(roomURL);
	$roomURLField.click(function() {
		this.select();
	});
	$div.append(formField("URL", "", "embed-room-url", $roomURLField));

	var $shareDiv = $("<div>").addClass('embed-share').append($("<a>").attr("href", "https://plus.google.com/share?url=" + roomURL).
					  attr("target", "_blank").
					  addClass("google  embed-share-button").text("Google+"));
	$shareDiv.append($("<a>").attr("href", "https://www.facebook.com/sharer/sharer.php?u=" + roomURL).
					 attr("target", "_blank").
					 addClass("facebook  embed-share-button").text("facebook"));
	$shareDiv.append($("<a>").attr("href", "https://twitter.com/intent/tweet?url=" + roomURL).
					 attr("target", "_blank").
					 addClass("twitter embed-share-button").text("twitter"));
	$div.append(
		formField("Share on", "", "share-embed", $shareDiv)
	);
	//qr code
	var qrCode = $("<img>").attr("src", "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=http://sb.lk/" + window.currentState.roomName);
	$div.append(
		formField("QR code", "", "embed-qr-code", qrCode)
	);
	//Embed customization
	$div.append(formField("Embed Customization", "", "embed-customization-title", ""));
	//change title color
	var $titleBackground = formField("Embed Title Color", "text", "embed-title-background", "#");
	$titleBackground.find("input").attr("type", "color");

	$div.append($titleBackground);
	//change background Image
	var $imageBackground = formField("Background Image URL", "text", "embed-image-background", "");
	$imageBackground.find("input").attr("type", "url");

	$div.append($imageBackground);
	//code.
	$div.append(formField("", "<p>", "embed-code-info",
						  format.textToHtml("Place the following code just before the closing </head> tag ")));
	var code = getCode();
	var $textarea = $("<textarea>").addClass("embed-code").attr("readonly", true).text(code);
  	$div.append(
    	formField("Code","", "embed-code", $textarea)
  	);
	var $email = $("<a>").attr("href", getMailToLink()).text("Email to developer");
	$div.append(formField("", "", "embed-email-link", $email));

	$textarea.click(function() {
		this.select();
	});

	$titleBackground.on("keydown paste input change", function() {
		var $titleTextField = $("#embed-title-background");
		var text = $titleTextField.val();
		var code = "";
		text.toLowerCase();
		if (/(^#[0-9a-f]{6}$)|(^#[0-9a-f]{3}$)/i.test(text)) {
			backgroundColor = text;
			code = getCode();
			$textarea.text(code);
			$titleTextField.removeClass("error");
		} else {
			$titleTextField.addClass("error");
		}

	});
	$imageBackground.on("keydown paste input change", function() {
		var $bkg = $('#embed-image-background');
		backgroundImage = $bkg.val();
		code = getCode();
		$textarea.text(code);
	});
    conf.embed = {
      text: "Share & Embed",
        html: $div,
        prio: 400
    };

    next();

	function getCode() {
		var code = '<script>window.scrollback = {%sroom:"' + window.currentState.roomName + '",form:"toast",theme:"dark",minimize:true};(function(d,s,h,e){e=d.createElement(s);e.async=1;e.src=(location.protocol === "https:" ? "https:" : "http:") + "//' + window.location.host + '/client.min.js";d.getElementsByTagName(s)[0].parentNode.appendChild(e);}(document,"script"));</script>';

		if (backgroundColor && backgroundImage) {
			code = parse(code, "backgroundColor:\"" + backgroundColor + "\",\"" +
						 "backgroundImage:\"" + backgroundImage + "\",");
		} else if (backgroundColor) {
			code = parse(code, "backgroundColor:\"" + backgroundColor + "\",");
		} else if (backgroundImage) {
			code = parse(code, "backgroundImage:\"" + backgroundImage + "\",");
		} else code = parse(code, "");
		return code;
	}
}, 500);



function parse(str) {
	var args = [].slice.call(arguments, 1),
		i = 0;

	return str.replace(/%s/g, function() {
		return args[i++];
	});
}

function getMailToLink() {
	return "mailto:?body=" + "Testingtext" + "&subject=codefadfasdf";
}
