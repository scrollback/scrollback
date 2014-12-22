var assert = require('assert'),
	timeout = 35000,
	config = require('../config.js'),
	webdriver = require('browserstack-webdriver'),
	testUtils = require('./testUtils.js'),
	q = require('q'),
	generator = require('../../lib/generate.js');

module.exports = function (capabilities, options) {
	describe('Create Room Test ' + options.id, function() {
		this.timeout(2 * timeout);
		var driver, server = options.server;
		var roomName = "t" + generator.names(28);
		before(function(done) {
			this.timeout(2 * timeout);
			driver = testUtils.openUrl(capabilities, server, roomName);
			setTimeout(done, 1.5 * timeout);
		});

		it("login facebook on create room view", function(done) {
			testUtils.loginFacebook(driver, config.facebookUser.email, config.facebookUser.password, function() {
				q.delay(3000).then(function() {
					return driver.findElement(webdriver.By.css(".dialog-action-create-room")).click();
				}).then(function() {
					return q.delay(2000);
				}).then(function() {
					return driver.findElement(webdriver.By.css(".conf-save")).click();
				}).then(function() {
					return q.delay(3000);
				}).then(function() {
					return driver.findElement(webdriver.By.id("room-item-" + roomName)).getText();
				}).then(function(t) {
					assert.equal(t, roomName, "Room creation failed");
					done();
				});
			}, ".noroom-create-room-guest");
		});

		after(function(done) {
			driver.quit();
			done();
		});
	});
};