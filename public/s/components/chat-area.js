/* jshint jquery: true */
/* global libsb */

$(function() {
	$(".chat-area").infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		getItems: function (index, before, after, callback) {
			var els = [], i;
			for(i=-before; i<0; i++) {
				if(index+i <= -100) { els.push(false); i=-(100+index); if(i>=0) break; }
				els.push($("<div>").text("Text message. " + (index + i)).data("index", index+i));
			}
			for(i=1; i<=after; i++) {
				if(index+i > 100) { els.push(false); break; }
				els.push($("<div>").text("Text message. " + (index + i)).data("index", index+i));
			}
			setTimeout(function() { callback(els); }, 1000); // simulate connection delay
//			console.log("requested", index, before, after);
		}
	});
	
	libsb.on('text-dn', function(text, next) {
		
	})
	
	setInterval(function() {
		var $logs = $("#logs");
		if($logs.data("lower-limit")) $("#logs").addBelow($("<div>").text("New, live text message.").data("index", 42));
	}, 4000);
	
	
	// --- add classes to body to reflect state ---
	
	var timeout,
		top = $(this).scrollTop();

	$(".chat-area").on("scroll", function() {
		var cur_top = $(this).scrollTop();

		if (top < cur_top) {
			$("body").removeClass("scroll-up").addClass("scroll-down");
		} else {
			$("body").removeClass("scroll-down").addClass("scroll-up");
		}

		top = cur_top;

		$("body").addClass("scrolling");

		if(timeout) clearTimeout(timeout);

		timeout = setTimeout(function(){
			$("body").removeClass("scrolling").removeClass("scroll-up").removeClass("scroll-down");
			timeout = 0;
		}, 1000);
	});

	
});


