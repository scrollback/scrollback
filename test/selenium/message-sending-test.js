var assert = require('assert'),
	fs = require('fs');
//npm install -g browserstack
var webdriver = require('browserstack-webdriver');
var test = require('browserstack-webdriver/testing');
var config = require("../config.js");
var timeout = 30000;
test.describe('Scrollback test', function() {
	this.timeout(timeout);
	var driver, server = "http://dev.scrollback.io";

	test.before(function() {
		this.timeout(3 * timeout);
		var capabilities = {
			'browserstack.debug' : config.selenium.debug,
			'browserName' : 'firefox', 
			'browserstack.user' : config.selenium.username,
			'browserstack.key' : config.selenium.accessKey
		}
		driver = new webdriver.Builder().
		usingServer('http://hub.browserstack.com/wd/hub').
		withCapabilities(capabilities).
		build();
		driver.get(server + '/scrollback');
		var time = new Date().getTime();
		driver.wait(function() {//wait for page load
			return new Date().getTime() - time >= 1.5 * timeout;
		}, 2 * timeout);
	});
	
	test.it('Messages sending test', function() {
		this.timeout(timeout);
		var searchBox = driver.findElement(webdriver.By.css('.chat-entry'));
		var random = Math.random();
		searchBox.sendKeys('hello Testing message from script: ' + random);
		driver.findElement(webdriver.By.css('.chat-send')).click();
		
		driver.wait(function() {
			return driver.findElement(webdriver.By.css('.chat-area')).getText().then(function(text) {
				console.log("text", text);
				console.log("index=", text.indexOf("" + random));
				return text.indexOf("" + random) !== -1;
			});
		}, 2000);
	});
	
	
	
	test.after(function() { 
		this.timeout(timeout);
		driver.quit(); 
	});
});