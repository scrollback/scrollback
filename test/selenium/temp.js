var assert = require('assert'),
	q = require('q'),
	fs = require('fs');

var webdriver = require('browserstack-webdriver');
test = require('browserstack-webdriver/testing');

test.describe('scrollback room', function() {
	var driver, server;

	test.before(function() {
		var capabilities = {
			'browserName': 'android',
			'platform': 'ANDROID',
			'device': 'Sony Xperia Tipo',
			'browserstack.user': 'chandrakantashat1',
			'browserstack.key': 'L9r68hEEouPpTAzPs9H6',
			'browserstack.debug': true
		};
		driver = new webdriver.Builder().
		usingServer('http://hub.browserstack.com/wd/hub').
		withCapabilities(capabilities).
		build();
	});

	test.it('Get title', function() {
		driver.get('http://stage.scrollback.io').
		then(function() {
			return driver.findElement(webdriver.By.id('home-go-to-room-entry')).sendKeys('scrollback');
		}).then(function() {
			return driver.findElement(webdriver.By.id('home-go-to-room-button')).click();
		}).then(function() {
			return driver.findElement(webdriver.By.css('.sb-user')).click();
		}).then(function() {
			return driver.findElement(webdriver.By.css('.persona')).click();
		}).then(function() {
			return driver.getAllWindowHandles();
		}).then(function(w) {
			win = w;
			return driver.switchTo().window(win[1]);
		}).then(function() {
			q.delay(3000);
		}).then(function() {
			return driver.
			findElement(webdriver.By.id('authentication_email')).sendKeys('chandra@scrollback.io');
		});
	});

	test.after(function() {
		driver.quit();
	});
});