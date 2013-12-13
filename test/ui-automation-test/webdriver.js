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
	driver.findElement(webdriver.By.name('q')).sendKeys('browserstack');
	driver.findElement(webdriver.By.name('btnG')).click();
	driver.getTitle().then(function(title) {
		assert.equal(title, 'browserstack - Google Search');
	});
	
	driver.quit();	
}




runTests(browsers[1]);

