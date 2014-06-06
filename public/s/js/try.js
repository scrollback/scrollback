/* jslint browser: true, indent: 4 */
/* global $ */

$(function() {
	$("body").addClass("stage-1");

	function validateRoom() {
		var roomname = $("#room-name").val();

		if (roomname.length > 2 && roomname.match(/^[a-z][a-z0-9-]{2,31}/)) {
			return true;
		} else {
			$("body").addClass("form-error");
			$("#room-name").focus();

			return false;
		}
	}

	$(".to-2").on("click", function() {
		if (validateRoom()) {
			$("body").removeClass("stage-1").addClass("stage-2");

			setTimeout(function() {
				$("#web-address").focus();
			}, 300);
		}
	});

	$("#preview-full").on("click", function() {
		if (validateRoom()) {
			window.open("http://next.scrollback.io/" + $("#room-name").val(), '_blank');
		}
	});

	$("#preview-embed").on("click", function() {
		var web = $("#web-address").val();

		if(!/^(https?):\/\//i.test(web)) {
			web = "http://" + web;
		}

		window.open("http://next.scrollback.io/t/" + $("#room-name").val() + "/" + web, '_blank');
	});

	$("input[type=text]").on("click keyup", function() {
		$("body").removeClass("form-error");
	});

	
    // Show scrollback embed widget
    $(".trial-room").on("click", function () {
        $("body").addClass("scrollback-open");
    });
});
