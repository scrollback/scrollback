var webdriver = require('browserstack-webdriver'),
	assert = require('assert'),
	testUtils = require('./testUtils.js'),
	config = require('../config.js'),
	q = require('q'),
	timeOut = 25000;
module.exports = function(capabilities, options) {
	describe('Account settings test: ' + options.id, function() {
		this.timeout(4 * timeOut);
		var driver, server = options.server,
			random = Math.random() + "";
		before(function(done) {
			this.timeout(4 * timeOut);
			driver = testUtils.openUrl(capabilities, server, "testroom1");
			testUtils.loginFacebook(driver, config.facebookUser.email, config.facebookUser.password, function() {
				console.log("logging in through facebook...");
				done();
			});
		});

		it("account settings test(profile)", function(done) {
			this.timeout(4 * timeOut);
			console.log("testing for user area");
			driver.findElement(webdriver.By.css('.main-area .user-area.js-has-user-menu')).click().
			then(function() {
				console.log("this is profile testing...");
				return driver.findElement(webdriver.By.css('.userpref')).click();
			}).then(function() {
				return q.delay(3000);
			}).then(function() {
				return driver.findElement(webdriver.By.css('.list-item-profile-settings')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.id('pref-about-me')).sendKeys(random);
			}).then(function() {
				return driver.findElement(webdriver.By.css('.conf-save')).click();
			}).then(function() {
				return q.delay(1000);
			}).then(function() {
				return driver.findElement(webdriver.By.css('.main-area .user-area.js-has-user-menu')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.userpref')).click();
			}).then(function() {
				return q.delay(3000);
			}).then(function() {
				return driver.findElement(webdriver.By.id('pref-about-me')).getAttribute("value");
			}).then(function(text) {
				console.log("text", text);
				var b = text.indexOf(random) !== -1;
				assert.equal(b, true, "saving not successful");
				driver.findElement(webdriver.By.css('.conf-save')).click();
				done();
			});
		});

		it("account settings test(Email)", function(done) {
			this.timeout(4 * timeOut);
			console.log("testing for user area");
			driver.findElement(webdriver.By.css('.main-area .user-area.js-has-user-menu')).click().
			then(function() {
				console.log("this is Email testing...");
				return driver.findElement(webdriver.By.css('.userpref')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.list-item-email-settings')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.radio-item')).click();
			}).then(function() {
				return driver.findElement(webdriver.By.css('.conf-save')).click();
			}).then(function() {
				return q.delay(3000);
			}).then(function() {
				return driver.findElement(webdriver.By.css(".main-area .user-area.js-has-user-menu"))
				.isDisplayed();
			}).then(function(t) {
				assert.equal(t, true, "saving unsuccessful");
				done();
			});
		});

		/*it("account settings test(notifications)", function(done){
			this.timeout(4 * timeOut);
			console.log("testing for user area");
			driver.findElement(webdriver.By.css('.user-area')).click().
			then(function() {
				console.log("this is account settings");
				return driver.findElement(webdriver.By.css('.userpref')).click();
			}).then(function(){
				return driver.findElement(webdriver.By.css('.list-item-notification-settings')).click();
			}).then(function(){
				return driver.findElement(webdriver.By.id('sound-notification')).click();
			}).then(function(){
				return driver.findElement(webdriver.By.id('desktop-notification')).click();
			}).then(function(){
				return driver.findElement(webdriver.By.css('.conf-save')).click();
			}).then(function(){
				return driver.findElement(webdriver.By.css(".sb-user")).isDisplayed();
			}).then(function(t){
				assert.equal(t, true, "saving unsuccessful");
				done();
			});
		});*/

		after(function(done) {
			this.timeout(timeOut);
			driver.quit();
			done();
		});
	});
};