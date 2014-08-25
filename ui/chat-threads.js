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
                $dots.data("animating", false).velocity("stop").velocity({
                    scale: 1,
                    opacity: 1
                }, 150);
            }

            if ($line.length) {
                $line.velocity("stop").velocity({
                    top: $line.offset().top + $line.height(),
                    opacity: 0
                }, 150);
            }
        },
        drawLine = function() {
            var $line = $(".chat-conv-line"),
                $chatdot = $(".chat-item-dot"),
                $convdot = $(".chat-conv-dot"),
                $dots = $("[data-thread=" + currThread + "]").find($chatdot).add($convdot),
                left = $container.offset().left,
                top = $dots.first().offset().top,
                bottom = $(document).height() - $convdot.offset().top - ($convdot.height() / 2),
                containertop = $container.offset().top;

            $chatdot.not($dots).velocity("stop").velocity({
                scale: 1,
                opacity: 0.3
            }, 150).data("animating", true);

            $dots.velocity("stop").velocity({
                scale: 1.5,
                opacity: 1
            }, 300).data("animating", true);

            if (!$line.length) {
                $line = $("<div>").addClass("chat-conv-line").attr("data-mode", "normal search").css({ opacity: 0 });
                $line.appendTo("body");
            }

            $line.css({
                left: left,
                bottom: bottom
            }).velocity("stop").velocity({
                top: ((top < containertop) ? containertop : top),
                opacity: 1
            }, 300);
        },
        updateLine = function() {
            if (currThread &&
                (window.currentState.view === "normal" || !window.currentState.view) &&
                (window.currentState.mode === "normal" || window.currentState.mode === "search")) {
                drawLine();
            } else {
                removeLine();
            }
        },
        selectConv = function(threadId) {
            var classes = $("body").attr("class").replace(/conv-\d+/g, "").trim();

            $("body").attr("class", classes);

            if (threadId && typeof threadId === "string") {
                currThread = threadId;

                $("body").addClass('conv-' + threadId.substr(-1));
            } else {
                currThread = null;
            }
        },
        resetConv = function(soft) {
            currMsg = null;

            $(".chat-item").removeClass("current").data("selected", false);

            if (!soft) {
                removeLine();
            }

            selectConv();
        };

    libsb.on("navigate", function(state, next) {
        if (state.old && (state.old.view !== state.view ||
                          state.old.thread !== state.thread ||
                          state.old.mode !== state.mode ||
                          state.old.room !== state.room
                         )) {

            removeLine();

            if (state.old.thread !== state.thread) {
                selectConv(state.thread);
            }

            if (state.old.roomName !== state.roomName) {
                currThread = null;
            }

            setTimeout(function() {
                updateLine();
            }, 1000);
        }

        next();
    }, 50);

    $container.on("scroll", function() {
        clearTimeout($(this).data("lineTimer"));

        $(this).data("lineTimer", setTimeout(function() {
            updateLine();
        }, 300));
    });

    $(window).on("resize", function() {
        removeLine();

        clearTimeout($(this).data("lineTimer"));

        $(this).data("lineTimer", setTimeout(function() {
            updateLine();
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

        selectConv(this.attr("data-thread"));

        this.addClass("current").data("selected", true);

        if ($.fn.velocity) {
            if ((this.offset().top - $container.offset().top) < 0 || this.offset().top > $container.height()) {
                this.velocity("scroll", { duration: 150, container: $container });
            }
        } else {
            this.get(0).scrollIntoView(true);
        }

        if (this.hasClass("chat-item-long")) {
            this.scrollTop(0);
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

            $entry.html(msg ? msg + "&nbsp;" : "");

            if (!("ontouchstart" in document)) {
                $entry.focus();

                if ($.fn.setCursorEnd) {
                    $entry.setCursorEnd();
                }
            }
        }

        if (!currThread || lastThread !== currThread) {
            updateLine();
        }

		return this;
	};

	$(document).on("click", ".chat-item", function() {
        $(".chat-item").not(this).removeClass("active");

        $(this).toggleClass("active").selectMsg();
	});

	$(document).on("keydown", function(e) {
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
