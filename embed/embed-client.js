/* jslint browser: true, indent: 4, regexp: true */
/* global $, libsb */

libsb.on("config-show", function (conf, next) {
    var code = '<script>window.scrollback = {room:"' + window.currentState.room + '",embed:"toast",theme:"dark",minimize:true};(function(d,s,h,e){e=d.createElement(s);e.async=1;e.src=(location.protocol == "https:" ? "https:" : "http:") + "//' + window.location.host + '/embed.js";d.getElementsByTagName(s)[0].parentNode.appendChild(e);}(document,"script"));</script>';

    var div = $("<div>").addClass("list-view list-view-embed-settings");
    var innerDiv = $("<div>").addClass("settings-item");
    var para = $("<p>").text("Place the following code just before the closing </body> tag ");
    var textarea = $("<textarea>").addClass("embed-code").attr("readonly", true).text(code);
    innerDiv.append(para, textarea);
    div.append(innerDiv);

    textarea.click(function () {
        this.select();
    });

    conf.embed = {
        html: div,
        text: "Embed code",
        prio: 400
    };

    next();
});
