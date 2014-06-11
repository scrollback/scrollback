/* jslint browser: true, indent: 4 */
/* global $ */

$(function() {
	$("body").addClass("stage-1");
	$("#room-name").focus();

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

	$(".to-1").on("click", function() {
		$("body").removeClass("stage-2").addClass("stage-1");

		setTimeout(function() {
			$("#room-name").focus();
		}, 300);
	});

	$("#preview-full").on("click", function() {
		if (validateRoom()) {
			window.open("http://next.scrollback.io/" + $("#room-name").val(), '_blank');
		}
	});

	function openWeb() {
		var web = $("#web-address").val();

		if(!/^(https?):\/\//i.test(web)) {
			web = web;
		}

		window.open("http://next.scrollback.io/t/" + $("#room-name").val() + "/" + web, '_blank');
	}

	$("#preview-embed").on("click", function() {
		openWeb();
	});

	$(document).on("keydown", function(e) {
		if (e.keyCode === 13 && $("body").hasClass("stage-2")) {
			openWeb();
		}
	});

	$("input[type=text]").on("click keyup", function() {
		$("body").removeClass("form-error");
	});

    // Show scrollback embed widget
    $(".trial-room").on("click", function () {
        $("body").addClass("scrollback-open");
    });
});
