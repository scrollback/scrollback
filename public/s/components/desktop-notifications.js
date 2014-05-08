/*jslint browser: true, indent: 4, regexp: true*/
/*global $, libsb, Notification, webkitNotifications*/

function requestNotifcation() {
    if ("webkitNotifications" in window) {
        if (webkitNotifications.checkPermission() !== 0) {
            webkitNotifications.requestPermission();
        }
    } else if ("Notification" in window) {
        if (Notification.permission !== "granted" && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
}

function showNotifcation(title, body, icon, id, func) {
    var notification;

    if ("webkitNotifications" in window) {
        if (webkitNotifications.checkPermission() === 0) {
            notification = webkitNotifications.createNotification(icon, title, body);
            notification.show();
            notification.onclick = func;
        }
    } else if ("Notification" in window) {
        if (Notification.permission === "granted") {
            notification = new Notification(title, { dir: "auto", lang: "en-US", body: body, tag: id, icon: icon });
            notification.onclick = func;
        }
    }
}

$(".requestnotif").on("click", requestNotifcation);

libsb.on('text-dn', function(text, next) {
    if (text.mentions.contains(libsb.user.id)) {
        showNotifcation("New mention on " + text.to, text.from + ": " + text.text, "s/img/scrollback.png", text.id, function() {
                libsb.emit("navigate", { room: text.to, time: text.time });
            });
    }

    next();
});
