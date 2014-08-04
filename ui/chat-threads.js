/* jshint browser: true */
/* global $, libsb, format */

$(function() {
    var $container = $(".chat-area"),
        $entry = $(".chat-entry"),
        lastMsg, lastThread, currMsg, currThread, autoText,
        removeLine = function() {
            var $line = $(".chat-conv-line"),
                $dots = $(".chat-item-dot, .chat-conv-dot");

            if ($dots.data("animating")) {
                $dots.data("animating", false)
                     .velocity("stop")
                     .velocity({
                        scale: 1,
                        opacity: 1
                    }, {
                        duration: 150,
                        backwards: true
                    });
            }

            if ($line.length) {
                $line.velocity("stop")
                    .velocity({
                        top: $line.offset().top + $line.height(),
                        opacity: 0
                    }, {
                        duration: 150,
                        backwards: true
                    });
            }
        },
        drawLine = function() {
            if (currThread) {
                var $line = $(".chat-conv-line"),
                    $chatdot = $(".chat-item-dot"),
                    $convdot = $(".chat-conv-dot"),
                    $dots = $("[data-thread=" + currThread + "]").find($chatdot).add($convdot),
                    left = $container.offset().left,
                    top = $dots.first().offset().top,
                    bottom = $(document).height() - $convdot.offset().top - ($convdot.height() / 2),
                    containertop = $container.offset().top;

                $chatdot.not($dots).velocity("stop")
                        .velocity({ scale: 1, opacity: 0.3 }, { duration: 150, drag: true })
                        .data("animating", true);

                $dots.velocity("stop")
                     .velocity({ scale: 1.5, opacity: 1 }, { duration: 300, drag: true })
                     .data("animating", true);

                if (!$line.length) {
                    $line = $("<div>").addClass("chat-conv-line").attr("data-mode", "normal").css({ opacity: 0 });
                    $line.appendTo("body");
                }

                $line.css({
                    left: left,
                    bottom: bottom
                });

                $line.velocity("stop")
                    .velocity({
                        top: ((top < containertop) ? containertop : top),
                        opacity: 1
                     }, 300);
            }
        },
        resetConv = function(soft) {
            var classes = $("body").attr("class").replace(/conv-\d+/g, "").trim();

            $("body").attr("class", classes);

            currMsg = null;
            currThread = null;

            $(".chat-item").removeClass("current").data("selected", false);

            if (!soft) {
                removeLine();
            }
        };

    libsb.on("navigate", function(state, next) {
        if (state.old && (state.old.view !== state.view ||
                          state.old.thread !== state.thread ||
                          state.old.mode !== state.mode ||
                          state.old.room !== state.room
                         )) {

            removeLine();

            if (state.old.thread !== state.thread) {
                currThread = state.thread;
            } else {
                currThread = null;
            }

            if (state.mode === "normal" && state.view === "normal") {
                setTimeout(function() {
                    drawLine();
                }, 1000);
            }
        }

        next();
    }, 50);

    $container.on("scroll", function() {
        clearTimeout($(this).data("lineTimer"));

        $(this).data("lineTimer", setTimeout(function() {
            drawLine();
        }, 300));
    });

    $(window).on("resize", function() {
        removeLine();

        clearTimeout($(this).data("lineTimer"));

        $(this).data("lineTimer", setTimeout(function() {
            drawLine();
        }, 1000));
    });

    $(document).on("keydown", function(e) {
        if (e.keyCode === 27) {
            resetConv();
        }
    });

    $.fn.selectMsg = function(autoSel) {
        if (this.data("selected")) {
            resetConv();

            return this;
        }

        lastThread = currThread;

        resetConv(true);

        currMsg = this.attr("id");
        currThread = this.attr("data-thread");

        if (currThread) {
            $("body").addClass("conv-" + currThread.substr(-1));
        }

        this.addClass("current").data("selected", true);

        if ($.fn.velocity) {
            if ((this.offset().top - $container.offset().top) < 0 || this.offset().top > $container.height()) {
                this.velocity("scroll", { duration: 150, container: $container });
            }
        } else {
            this.get(0).scrollIntoView(true);
        }

        var nick = this.find(".chat-nick").text(),
            msg = format.htmlToText($entry.html()),
			atStart = false;

        msg = msg ? msg : "";

		if (msg.match(/^@\S+[\s+{1}]?/, "")) {
			msg = msg.replace(/^@\S+[\s+{1}]?/, "");
			atStart = true;
		} else {
			msg = msg.replace(/@\S+[\s+{1}]?$/, "");
		}

        if (msg.indexOf("@" + nick) < 0 && libsb.user && (libsb.user.id !== nick && libsb.user.id !== "guest-" + nick)) {
			if (atStart) {
				msg = "@" + nick + (msg ? " " + msg : "");
			} else {
				msg = (msg ? msg + " " : "") + "@" + nick;
			}
		}

		msg = format.textToHtml(msg);

        if ($entry.text() === "" || (($entry.text().indexOf(autoText) > -1) && !autoSel)) {
            autoText = format.htmlToText(msg);

            $entry.html(msg ? msg + "&nbsp;" : "").focus();

            if ($.fn.setCursorEnd) {
                $entry.setCursorEnd();
            }
        }

        if (!currThread || lastThread !== currThread) {
            removeLine();
            drawLine();
        }

		return this;
	};

	$(document).on("click", ".chat-item", function() {
        $(".chat-item").not(this).removeClass("active");

        $(this).toggleClass("active").selectMsg();
	});

	$(document).on("keydown", function(e){
        var $chat, $el;

		if (e.keyCode === 38 || e.keyCode === 40) {
			if ($(".chat-item.current").length) {
				$chat = $(".chat-item.current");

                if (e.keyCode === 38 && $chat.prevAll(":visible").first().length) {
					e.preventDefault();

                    $el = $chat.prevAll(":visible").first();
				} else if (e.keyCode === 40) {
					e.preventDefault();

                    if ($chat.nextAll(":visible").first().length) {
                        $el = $chat.nextAll(":visible").first();
					} else {
						resetConv();
					}
				}

				if ($el) {
					$el.selectMsg();
				}
			} else {
                $chat = $(".chat-item:visible").last();

                if (e.target === $entry.get(0) && $chat.length && e.keyCode === 38) {
					e.preventDefault();

                    $chat.selectMsg();
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
        autoText = null;

		next();
	}, 50);

	libsb.on("text-dn", function(text, next) {
        if ((text.id && text.id === lastMsg) ||
            (libsb.user && text.mentions && text.mentions.length && (text.mentions.indexOf(libsb.user.id) > -1)) ||
            (lastMsg && lastMsg.mentions && lastMsg.mentions.length && (lastMsg.mentions.indexOf(text.from) > -1)) ||
            (currThread && text.threads && text.threads.length && text.threads[0].id === currThread)
		) {
			$("#chat-" + text.id).selectMsg(true);
		}

		next();
	}, 50);

	$(document).on("click", ".chat-conv-dot-wrap", function() {
		resetConv();
	});
});
