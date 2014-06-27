/* jshint browser: true */
/* global $, libsb */

libsb.on("text-dn", function(text, next) {
    var $chat = $("#chat-" + text.id);

    if ($chat.length && $.fn.velocity) {
        $chat.velocity("transition.slideUpBigIn", { duration: 150 });
    }

    next();
}, 10);
