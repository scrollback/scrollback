/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb */

libsb.on("config-show", function (conf, next) {
    var code = '<script>window.scrollback = {room:"' + window.currentState.roomName + '",form:"toast",theme:"dark",minimize:true};(function(d,s,h,e){e=d.createElement(s);e.async=1;e.src=(location.protocol === "https:" ? "https:" : "http:") + "//' + window.location.host + '/client.min.js";d.getElementsByTagName(s)[0].parentNode.appendChild(e);}(document,"script"));</script>',
        $textarea = $("<textarea>").addClass("embed-code").attr("readonly", true).text(code),
        $div = $("<div>").append($("<div>").addClass("settings-item").append(
            $("<p>").text("Place the following code just before the closing </body> tag "),
            $textarea
        ));

    $textarea.click(function() {
        this.select();
    });

    conf.embed = {
        text: "Embed",
        html: $div,
        prio: 400
    };

    next();
}, 500);
