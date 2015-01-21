var assert = require('assert'),
	timeout = 25000,
	webdriver = require('browserstack-webdriver'),
	q = require('q'),
	testUtils = require('./testUtils.js');

module.exports = function(capabilities, options) {
	describe('Embed Api Test: ' + options.id, function() {
		this.timeout(4 * timeout);
		var driver, externalServer = options.server;
		
		it("Room does-not exist", function(done) {
			driver = testUtils.openUrl(capabilities, externalServer,"/t/");
			q.delay(timeout).then(function() {
				return driver.findElement(webdriver.By.id('roomName')).sendKeys("dsldncajsdnlkjansd");
			}).then(function() {
				return driver.findElement(webdriver.By.id('basic-embed')).click();
			}).then(function() {
				return driver.switchTo().frame(0); //if there is only one frame
			}).then(function() {
				return driver.findElement(webdriver.By.css(".noroom-dialog")).isDisplayed();
			}).then(function(t) {
				assert.equal(t, true, "page is not loaded");
				driver.quit();
				done();
			});
		});
		
		it("Room does-not exist", function(done) {
			driver = testUtils.openUrl(capabilities, externalServer,"/t/");
			q.delay(timeout).then(function() {
				return driver.findElement(webdriver.By.id('roomName')).sendKeys("scrollback");
			}).then(function() {
				return driver.findElement(webdriver.By.id('basic-embed')).click();
			}).then(function() {
				return driver.switchTo().frame(0); //if there is only one frame
			}).then(function() {
				return driver.findElement(webdriver.By.css(".noroom-dialog")).isDisplayed();
			}).then(function(t) {
				assert.equal(t, false, "page is not loaded");
				driver.quit();
				done();
			});
		});
		
		
	});
};