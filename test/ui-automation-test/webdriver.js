// Selenium Installation: 
// npm install selenium-webdriver
var url = "http://hub.browserstack.com/wd/hub";
var webdriver = require('selenium-webdriver');
var assert = require("assert");
var browsers = require("./browsers.js");

function runTests(caps) {
	var driver = new webdriver.Builder().usingServer(url).withCapabilities(caps).build();
	var roomname = ''
	
	
	/*
	Checking if the socket connection is established correctly and existing messages are loaded without errors (this is done by initializing the DB with some initial test data).
Sending a message as a guest user.
 Logging in (assertion for a nick change here).
 Sending a message as a logged in user.
 Logging out.
 Changing the user nick.
 Test to check if plug ins are working correctly : (Banned words, Repetitive messages) 
 Logging in from archive view. 
 Logging out from archive view.
 Sending a message from archive view (This test case is currently not working).
	*/
	// Load a nonexistent scrollback room
	driver.get('http://dev.scrollback.io/pwn/testroom/asdf.com');
	
	require("verifyEmbed.js")(driver);
	require("sendAndVerifyMessage.js")(driver);
	require("signInEmbed.js")(driver);
	require("sendAndVerifyMessage.js")(driver);
	require("signOutEmbed.js")(driver);
	
	driver.quit().then(function() {
		console.log('Woo! All tests passed!');
	});
	
//	console.log(driver.controlFlow() == driver.flow_);
	
	driver.controlFlow().on('uncaughtException', function(e) {
		console.error(e);
		console.log('A test failed :(');
		driver.quit();
	});
}




runTests(browsers[1]);

