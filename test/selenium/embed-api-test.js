var assert = require('assert'),
	timeout = 25000,
	webdriver = require('browserstack-webdriver'),
	generate = require("./../../lib/generate.js"),
	config = require('../config.js'),
	q = require('q'),
	testUtils = require('./testUtils.js');

module.exports = function(capabilities, options) {
	describe('Embed Api Test: ' + options.id, function() {
		this.timeout(4 * timeout);
		var driver, externalServer = options["jws-parent"];
		var server = options.server;
		var private_key = config.jws["private-keys"][config["jws-parent"]];
		it("Room does-not exist", function(done) {
			driver = testUtils.openUrl(capabilities, externalServer, "t/");
			q.delay(timeout).then(function() {
				return driver.findElement(webdriver.By.id('roomName')).sendKeys("dsldncajsdnlkjansd");
			}).then(function() {
				return driver.findElement(webdriver.By.id('basic-embed')).click();
			}).then(function() {
				return q.delay(3000);
			}).then(function() {
				return driver.switchTo().frame(0); //if there is only one frame
			}).then(function() {
				return driver.findElement(webdriver.By.css(".noroom-dialog")).isDisplayed();
			}).then(function(t) {
				assert.equal(t, true, "page is not loaded");
				return driver.quit().then(done);
			});
		});



		it("jws login", function(done) {
			var jws = testUtils.generateJWS(externalServer.replace("http://", ""), config.jws.email, server, private_key);

			console.log(config.jws.username);
			driver = testUtils.openUrl(capabilities, externalServer, "t/");
			q.delay(1000).then(function() {
				return driver.findElement(webdriver.By.id('roomName')).sendKeys("scrollback");
			}).then(function() {
				return driver.findElement(webdriver.By.id('jws')).sendKeys(jws);
			}).then(function() {
				return driver.findElement(webdriver.By.id('basic-room-jws')).click();
			}).then(function() {
				return q.delay(3000);
			}).then(function() {
				return driver.switchTo().frame(0);
			}).then(function() {
				return driver.findElement(webdriver.By.css('.chat-placeholder')).getText();
			}).then(function(t) {
				assert.equal(t.indexOf(config.jws.username) >= 0, true, "room not loaded correctly");
				return driver.quit().then(done);
			});
		});

		it("suggested nick login", function(done) {
			var nick = generate.names(12);
			driver = testUtils.openUrl(capabilities, externalServer, "t/");
			q.delay(1000).then(function() {
				return driver.findElement(webdriver.By.id('roomName')).sendKeys("scrollback");
			}).then(function() {
				return driver.findElement(webdriver.By.id('nick')).sendKeys(nick);
			}).then(function() {
				return driver.findElement(webdriver.By.id('basic-room-nick')).click();
			}).then(function() {
				return q.delay(3000);
			}).then(function() {
				return driver.switchTo().frame(0);
			}).then(function() {
				return driver.findElement(webdriver.By.css('.chat-placeholder')).getText();
			}).then(function(t) {
				assert.equal(t.indexOf(nick) >= 0, true, "room not loaded correctly");
				return driver.quit().then(done);
			});
		});


		describe('Room creation test without identity' + options.id, function() {
			var room = generate.names(12);
			it("room creation", function(done) {
				var jws = testUtils.generateJWS(externalServer.replace("http://", ""), config.jws.email, server, private_key);
				driver = testUtils.openUrl(capabilities, externalServer, "t/");
				q.delay(1000).then(function() {
					return driver.findElement(webdriver.By.id('roomName')).sendKeys(room);
				}).then(function() {
					return driver.findElement(webdriver.By.id('jws')).sendKeys(jws);
				}).then(function() {
					return driver.findElement(webdriver.By.id('createRoom')).click();
				}).then(function() {
					return driver.findElement(webdriver.By.id('basic-room-jws')).click();
				}).then(function() {
					return q.delay(3000);
				}).then(function() {
					return driver.switchTo().frame(0);
				}).then(function() {
					return driver.findElement(webdriver.By.css('.dialog-action-create-room')).click();
				}).then(function() {
					return q.delay(3000);
				}).then(function() {
					return driver.findElement(webdriver.By.css(".mode-conf")).isDisplayed();
				}).then(function(t) {
					assert.equal(t, true, "room not loaded correctly");
					return driver.quit().then(done);
				});
			});
			it("Room exist", function(done) {
				driver = testUtils.openUrl(capabilities, externalServer, "t/");
				q.delay(timeout).then(function() {
					return driver.findElement(webdriver.By.id('roomName')).sendKeys(room);
				}).then(function() {
					return driver.findElement(webdriver.By.id('basic-embed')).click();
				}).then(function() {
					return q.delay(3000);
				}).then(function() {
					return driver.switchTo().frame(0); //if there is only one frame
				}).then(function() {
					return driver.findElement(webdriver.By.css(".mode-normal")).isDisplayed();
				}).then(function(t) {
					assert.equal(t, true, "room not loaded correctly");
					return driver.quit().then(done);
				});
			});

		});

		describe('Room creation test with identity' + options.id, function() {
			var room = generate.names(12);
			it("room creation", function(done) {
				var jws = testUtils.generateJWS(externalServer.replace("http://", ""), config.jws.email, server, private_key);
				driver = testUtils.openUrl(capabilities, externalServer, "t/");
				q.delay(1000).then(function() {
					return driver.findElement(webdriver.By.id('roomName')).sendKeys(externalServer.replace("http://", "") + ":" + room);
				}).then(function() {
					return driver.findElement(webdriver.By.id('jws')).sendKeys(jws);
				}).then(function() {
					return driver.findElement(webdriver.By.id('createRoom')).click();
				}).then(function() {
					return driver.findElement(webdriver.By.id('basic-room-jws')).click();
				}).then(function() {
					return q.delay(3000);
				}).then(function() {
					return driver.switchTo().frame(0);
				}).then(function() {
					return driver.findElement(webdriver.By.css('.dialog-action-create-room')).click();
				}).then(function() {
					return q.delay(3000);
				}).then(function() {
					return driver.findElement(webdriver.By.css(".mode-conf")).isDisplayed();
				}).then(function(t) {
					assert.equal(t, true, "room not loaded correctly");
					return driver.quit().then(done);
				});
			});

			it("Room exist", function(done) {
				driver = testUtils.openUrl(capabilities, externalServer, "t/");
				q.delay(timeout).then(function() {
					return driver.findElement(webdriver.By.id('roomName')).sendKeys(externalServer.replace("http://", "") + ":" + room);
				}).then(function() {
					return driver.findElement(webdriver.By.id('basic-embed')).click();
				}).then(function() {
					return q.delay(3000);
				}).then(function() {
					return driver.switchTo().frame(0);
				}).then(function() {
					return driver.findElement(webdriver.By.css(".mode-normal")).isDisplayed();
				}).then(function(t) {
					assert.equal(t, true, "room not loaded correctly");
					return driver.quit().then(done);
				});
			});

		});
	});
};