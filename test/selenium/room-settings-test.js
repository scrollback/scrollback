var webdriver = require('browserstack-webdriver'),
	assert = require('assert'),
	testUtils = require('./testUtils.js'),
	config = require('../config.js'),
	timeOut = 25000;

module.exports = function(capabilities, options) {
	describe('Room settings test: ' + options.id, function() {
		this.timeout(4 * timeOut);
		var driver, server = options.server,
			random = Math.random() + "";

		before(function(done) {
			this.timeout(4 * timeOut);

			driver = testUtils.openUrl(capabilities, server, "room1");

			testUtils.loginPersona(driver, config.personaUser.email, config.personaUser.password, function() {
				console.log("logging in through Persona...");
				done();
			});
		});

		it("General settings test", function(done) {
			this.timeout(4 * timeOut);
			driver.findElement(webdriver.By.css('.tab-info')).click().
			then(function() {
				return driver.findElement(webdriver.By.css('.configure-button')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.id('description')).clear();
			}).then(function() {
				return driver.findElement(webdriver.By.id('description')).sendKeys(random);
			}).then(function() {
				return driver.findElement(webdriver.By.css('.conf-save')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.configure-button')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.id('description')).getAttribute("value");
			}).then(function(text) {
				console.log("Room description: ", random);
				var b = text.indexOf(random) !== -1;
				assert.equal(b, true, "saving not successful");
				/*driver.findElement(webdriver.By.css('.conf-save')).click();*/
				done();
			});
		});

		it("Permissions test", function(done) {
			this.timeout(4 * timeOut);
			/*driver.findElement(webdriver.By.css('.tab-info')).click().
			then(function(){
				console.log("configuring room...");
				return driver.findElement(webdriver.By.css('.configure-button')).click();
			}).then(function(){
				return */driver.findElement(webdriver.By.css('.list-item-authorizer-settings')).click()/*;
			})*/.then(function() {
				return driver.findElement(webdriver.By.id('authorizer-post-guest')).click();
			})/*.then(function(){
				return driver.findElement(webdriver.By.id('authorizer-post-users')).click();
			}).then(function(){
				return driver.findElement(webdriver.By.id('authorizer-post-followers')).click();
			})*/.then(function() {
				console.log("saved");
				return driver.findElement(webdriver.By.css('.conf-save')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.configure-button')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.list-item-authorizer-settings')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.id('authorizer-post-guest')).isEnabled();
			}).then(function(t) {
				assert.equal(t, true, "saving unsuccessful");
				driver.findElement(webdriver.By.css('.conf-save')).click();
				done();
			});
		});

		it("Spam control test", function(done) {
			this.timeout(4 * timeOut);
			driver.findElement(webdriver.By.css('.tab-info')).click().
			then(function() {
				return driver.findElement(webdriver.By.css('.configure-button')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.list-item-spam-settings')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.id('block-custom')).clear();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.conf-save')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.configure-button')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.list-item-spam-settings')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.id('block-custom')).sendKeys("block" + random);
			}).then(function() {
				return driver.findElement(webdriver.By.id('list-en-strict')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.conf-save')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css(".configure-button")).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.list-item-spam-settings')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.id('list-en-strict')).isEnabled();
			}).then(function(t) {
				assert.equal(t, true, "saving unsuccessful");
			}).then(function() {
				return driver.findElement(webdriver.By.id('block-custom')).getAttribute("value");
			}).then(function(text) {
				console.log("blocked word is: ", text);
				var b = text.indexOf(random) !== -1;
				assert.equal(b, true, "saving not successful");
				done();
			});
		});

		after(function(done) {
			this.timeout(timeOut);
			driver.quit();
			done();
		});
	});
};
