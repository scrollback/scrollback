/* jshint jquery: true */
/* global libsb, renderChat, format */
/* exported chatArea */

var chatArea = {};

$(function() {
	var $logs = $(".chat-area"),
		room = 'testroom', /* replace with room from URL */
		time = null; /* replace this with the time from the URL, if available. */
	
	// Set up infinite scroll here.
	
	$logs.infinite({
		scrollSpace: 2000,
		fillSpace: 500,
		itemHeight: 50,
		startIndex: time,
		getItems: function (index, before, after, callback) {
			console.log(arguments);
			libsb.getTexts({
				to: room, time: index, before: before, after: after
			}, function(err, texts) {
				console.log(arguments);
				if(err) throw err; // TODO: handle the error properly.
				callback(texts.map(function(text) {
					return text && renderChat(null, text);
				}));
			});
		}
	});
	
	// Insert incoming text messages.
	
	libsb.on('text-dn', function(text, next) {
		if($logs.data("lower-limit"))
			$logs.addBelow(renderChat(null, text));
		next();
	});
	
	// The chatArea API.
	
	chatArea.setBottom = function(bottom) {
		var atBottom = ($logs.scrollTop() + $logs.height() == $logs[0].scrollHeight);
		
		$logs.css({ bottom: bottom });
		if(atBottom) $logs.scrollTop($logs[0].scrollHeight);
	};
	
	chatArea.setRoom = function(r) {
		room = r;
		$logs.find(".chat").remove();
		$logs.scroll();
	};

	// --- add classes to body to reflect state ---

	var timeout,
		top = $(this).scrollTop();

	$logs.on("scroll", function() {
		var atBottom = ($logs.scrollTop() + $logs.height() == $logs[0].scrollHeight);
		var cur_top = $logs.scrollTop();
		
		if(atBottom) return;

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
		
		var chats = $logs.find('.chat'), 
			time = chats.eq(0).data("index"), 
			parentOffset = $logs.offset().top,
			i;
		
		for(i=0; i<chats.size(); i++) {
			if(chats.eq(i).offset().top - parentOffset > 0) {
				time = chats.eq(i).data("index");
				break;
			}
		}
		
		$(".chat-position").text(format.friendlyTime(time, new Date().getTime()));
		
	});
});


