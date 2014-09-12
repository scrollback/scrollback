/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/* global window, document */

var pushNotification;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
		alert("device ready.");
		pushNotification = window.plugins && window.plugins.pushNotification;
		if(!pushNotification) {alert("pushNotification isn't ready."); return; }
		
		if ( device.platform == 'android' || device.platform == 'Android' )
		{
			// alert('device ready; android ' + device.platform+" "+pushNotification);
			pushNotification.register(
				successHandler,
				errorHandler, {
					"senderID":"102182143483",
					"ecb":"onNotificationGCM"
				});
		}
		else
		{
			alert('device ready; not android');
			pushNotification.register(
				tokenHandler,
				errorHandler, {
					"badge":"true",
					"sound":"true",
					"alert":"true",
					"ecb":"onNotificationAPN"
				});
		}
		
				// result contains any message sent from the plugin call
		function successHandler (result) {
			alert('registration success result = ' + result);
		}

				// result contains any error description text returned from the plugin call
		function errorHandler (error) {
			alert('registration error = '+error);
		}

		function tokenHandler (result) {
			// Your iOS push server needs to know the token before it can push to this device
			// here is where you might want to send it the token for later use.
			alert('registration success device token = ' + result);
		}
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
       alert('Received Event: ' + id);
    }
};

// iOS
function onNotificationAPN (event) {
	if ( event.alert )
	{
		alert(event.alert);
	}

	if ( event.sound )
	{
		var snd = new Media(event.sound);
		snd.play();
	}

	if ( event.badge )
	{
		pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
	}
}

// Android
function onNotificationGCM(e) {
	alert("Got notification", e.event);

	switch( e.event )
	{
	case 'registered':
		if ( e.regid.length > 0 )
		{
			// Your GCM push server needs to know the regID before it can push to this device
			// here is where you might want to send it the regID for later use.
			alert("regID = " + e.regid);
			alert("regID = " + e.regid);
			
		}
	break;

	case 'message':
			alert(e);
		// if this flag is set, this notification happened while we were in the foreground.
		// you might want to play a sound to get the user's attention, throw up a dialog, etc.
		if ( e.foreground )
		{
			alert(e.payload.message);
		}
		

	break;

	case 'error':
			alert( e.msg );
	break;

	default:
			alert(e);
	break;
  }
}


window.app = app;
app.initialize();
