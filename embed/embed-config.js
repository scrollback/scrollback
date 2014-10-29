/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb, currentState */
var formField = require('../lib/formField.js');
libsb.on("config-show", function (conf, next) {
   //room URL
	var $div = $("<div>");
	var roomURL = "https://" + window.location.host + "/" + currentState.roomName;
	var $roomURLField = formField("URL", "text", "embed-room-url", roomURL).attr("readonly", "readonly");
	$roomURLField.click(function() {
		this.select();
	});
    $div.append($roomURLField);

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
	var qrCode = $("<img>").attr("src", "https://api.qrserver.com/v1/create-qr-code/?size=128x128&data=https://sb.lk/" + currentState.roomName);
	$div.append(
		formField("QR code", "", "embed-qr-code", qrCode)
	);

	var code = '<script>window.scrollback = {room:"' + window.currentState.roomName + '",form:"toast",theme:"dark",minimize:true};(function(d,s,h,e){e=d.createElement(s);e.async=1;e.src=(location.protocol === "https:" ? "https:" : "http:") + "//' + window.location.host + '/client.min.js";d.getElementsByTagName(s)[0].parentNode.appendChild(e);}(document,"script"));</script>';
	var $textarea = $("<textarea>").addClass("embed-code").attr("readonly", true).text(code);
  	$div.append(
    	formField("Code","", "embed-code", $textarea)
		/*$("<p>").text("Place the following code just before the closing </body> tag "),
		$textarea*/
  	);

	$textarea.click(function() {
		this.select();
	});
    conf.embed = {
      text: "Share & Embed",
        html: $div,
        prio: 400
    };

    next();
}, 500);

