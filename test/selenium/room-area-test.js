var webdriver = require('browserstack-webdriver'),
	timeout = 25000,
	testUtils = require('./testUtils.js'),
	config = require('../config.js'),
	assert = require('assert'),
	q = require('q'),
	generator = require('../../lib/generate.js');
module.exports = function(capabilities, options) {
	describe("Room area test: " + options.id, function() {
		this.timeout(4 * timeout);
		var driver,
			server = options.server;
		before(function(done) {
			driver = testUtils.openUrl(capabilities, server, "room1");
			testUtils.loginFacebook(driver, config.facebookUser.email, config.facebookUser.password, function() {
				console.log("logging in through Facebook...");
				done();
			});
		});

		it("Testing for room existance", function(done) {
			this.timeout(4 * timeout);
			var room = Math.floor(Math.random() * config.user.followedRooms.length);
			driver.findElement(webdriver.By.id('room-item-' + config.user.followedRooms[room])).click().
			then(function() {
				return driver.findElement(webdriver.By.id('room-title')).getText();
			}).then(function(t) {
				console.log(t);
				assert.equal(t, config.user.followedRooms[room], "room does not exists");
				done();
			});
		});

		it("Testing for create room", function(done) {
			this.timeout(4 * timeout);
			var roomName = "t" + generator.names(8);
			driver.findElement(webdriver.By.css('.js-create-room')).click().
			then(function() {
				console.log("creating room", roomName);
				return driver.findElement(webdriver.By.id('createroom-dialog-room')).sendKeys(roomName);
			}).then(function() {
				return driver.findElement(webdriver.By.css('.dialog-action-create-room')).click();
			}).then(function() {
				q.delay(2000);
			}).then(function() {
				return driver.findElement(webdriver.By.css('.conf-save')).click();
			}).then(function() {
				q.delay(3000);
			}).then(function() {
				return driver.findElement(webdriver.By.id('room-title')).getText();
			}).then(function(t) {
				console.log(t);
				assert.equal(t, roomName, "Some problem is there");
				done();
			});
		});

		after(function(done) {
			this.timeout(timeout);
			driver.quit();
			done();
		});
	});
};