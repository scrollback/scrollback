/* jshint browser: true */
/* global $, libsb, format */

$(function() {
	var $container = $(".chat-area"),
		$entry = $(".chat-entry"),
		lastMsg, currMsg, currThread,
		resetConv = function() {
			var classes = $("body").attr("class").replace(/conv-\d+/g, "").trim();

			$("body").attr("class", classes);

			currMsg = null;
			currThread = null;

			removeLine();

			$(".chat-item").removeClass("current active");
		},
		removeLine = function() {
			var $line = $(".chat-conv-line"),
				$dot = $(".chat-item-dot, .chat-conv-dot");

			$dot.velocity("stop")
			.velocity({ scale: 1, opacity: 1 }, 150);

			if ($line.length) {
				$line.velocity("stop")
					 .velocity({ translateY: ( $line.height() / 2 ), scaleY: 0, opacity: 0 },
											   300, function() { $(this).remove(); });
			}
		},
		drawLine = function() {
			removeLine();

			if (currThread) {
				var $line = $("<div>").addClass("chat-conv-line").attr("data-mode", "normal"),
					$chatdot = $(".chat-item-dot"),
					$convdot = $(".chat-conv-dot"),
					$dot = $("[data-thread=" + currThread + "]").find($chatdot).add($convdot),
					left = $container.offset().left,
					top = $dot.first().offset().top,
					bottom = $(document).height() - $convdot.offset().top - ($convdot.height() / 2),
					containertop = $container.offset().top;

				$chatdot.not($dot).velocity("stop")
								  .velocity({ scale: 1, opacity: 0.3 }, { duration: 150 });

				$dot.velocity("stop")
					.velocity({ scale: 1 }, { duration: 150 })
					.velocity({ scale: 1.5, opacity: 1 }, { duration: 300 });

				$line.css({ top: ((top < containertop) ? containertop : top), left: left, bottom: bottom }).appendTo("body");

				$line.velocity("stop")
					 .velocity({ translateY: ( $line.height() / 2 ), scaleY: 0, opacity: 0 }, 0)
					 .velocity({ translateY: 0, scaleY: 1, opacity: 0.5 }, 300)
					 .velocity({ opacity: 1 }, 150);
			}
		};

	$container.scroll(function() {
		clearTimeout($(this).data("scrollTimer"));

		removeLine();

		$(this).data("scrollTimer", setTimeout(function() {
			drawLine();
		}, 500));
	});

	$(window).on("resize", drawLine);

	$.fn.selectMsg = function() {
		resetConv();

		currMsg = this.attr("id");
		currThread = this.attr("data-thread");

		if (currThread) {
			$("body").addClass("conv-" + currThread.substr(-1));
		}

		this.addClass("current");

		if ($.fn.velocity) {
			if ((this.offset().top - $container.offset().top) < 0 || this.offset().top > $container.height()) {
				this.velocity("scroll", { duration: 150, container: $container });
			}
		} else {
			this.get(0).scrollIntoView(true);
		}

		var nick = this.find(".chat-nick").text(),
			msg = format.htmlToText($entry.html()).trim(),
			atStart = false;

		if (msg.match(/^@\S+[\s+{1}]?/, "")) {
			msg = msg.replace(/^@\S+[\s+{1}]?/, "");
			atStart = true;
		} else {
			msg = msg.replace(/@\S+[\s+{1}]?$/, "");
		}

		if (msg.indexOf("@" + nick) < 0 && libsb.user.id !== nick) {
			if (atStart) {
				msg = "@" + nick + (msg ? " " + msg : "");
			} else {
				msg = (msg ? msg + " " : "") + "@" + nick;
			}
		}

		msg = format.textToHtml(msg);

		$entry.html(msg ? msg + "&nbsp;" : "").focus();

		if ($.fn.setCursorEnd) {
			$entry.setCursorEnd();
		}

		drawLine();

		return this;
	};

	$(document).on("click", ".chat-item", function() {
		$(this).selectMsg();
	});

	$(document).on("keydown", function(e){
		if (e.keyCode === 38 || e.keyCode === 40) {
			if ($(".chat-item.current").length) {
				var $chat = $(".chat-item.current"),
					$el;

				if (e.keyCode === 38 && $chat.prev().length) {
					e.preventDefault();
					$el = $chat.prev();
				} else if (e.keyCode === 40) {
					e.preventDefault();

					if ($chat.next().length) {
						$el = $chat.next();
					} else {
						resetConv();
					}
				}

				if ($el) {
					$el.selectMsg();
				}
			} else {
				if (e.target === $entry.get(0) && $(".chat-item").last().length && e.keyCode === 38) {
					e.preventDefault();

					$(".chat-item").last().selectMsg();
				}
			}
		}
	});

	libsb.on("text-up", function(text, next) {
		var $chat = $(".chat-item.current");

		if ($chat.length && currThread) {
			text.threads = [ { id: currThread, score: 1.0 } ];
		}

		lastMsg = text.id;

		next();
	}, 50);

	libsb.on("text-dn", function(text, next) {
		if (currThread && (
			(text.from && lastMsg.mentions && lastMsg.mentions.length && (lastMsg.mentions.indexOf(text.from) > -1)) ||
			(text.threads && text.threads.length && text.threads[0].id === currThread) ||
			(text.id && text.id === lastMsg)
		)) {
			$("#chat-" + text.id).selectMsg();
		}

		next();
	}, 50);

	$(document).on("click", ".chat-item", function() {
		$(this).toggleClass("active").scrollTop(0);
	});

	$(document).on("click", ".chat-conv-dot-wrap", function() {
		resetConv();
	});
});
