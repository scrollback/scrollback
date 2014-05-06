/*jslint browser: true, indent: 4, regexp: true*/
/*global $, Notification, webkitNotifications*/

function showNotifcation(title, body, icon, id, func) {
	var notification;

	if ("Notification" in window) {
		if (Notification.permission === "granted") {
			notification = new Notification(title, { dir: "auto", lang: "en-US", body: body, tag: id, icon: icon });
			notification.onclick = func;
		} else if (Notification.permission !== 'denied') {
			Notification.requestPermission();
		}
	} else if ("webkitNotifications" in window) {
		if (webkitNotifications.checkPermission() === 0) {
			notification = webkitNotifications.createNotification(icon, title, body);
			notification.show();
			notification.onclick = func;
		} else {
			webkitNotifications.requestPermission();
		}
	}
}
