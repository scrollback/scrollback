/* jshint browser: true */
/* global $, libsb */

libsb.on("text-up", function(text, next) {
    var $chat = $("#chat-" + text.id);

    if ($chat.length && $.fn.velocity) {
        $chat.velocity("stop")
             .velocity({ translateY: $(this).height(), opacity: 0 }, 0)
             .velocity({ translateY: 0, opacity: 1 }, 150);
    }

    next();
}, 20);

libsb.on("text-dn", function(text, next) {
    var $chat = $("#chat-" + text.id);

    if ($chat.length && $.fn.velocity) {
        $chat.velocity("stop")
        .velocity({ scaleY: 0, opacity: 0 }, 0)
        .velocity({ scaleY: 1, opacity: 1 }, 150);
    }

    next();
}, 20);
