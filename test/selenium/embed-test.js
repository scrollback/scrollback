var assert = require('assert'),
	timeout = 25000,
	webdriver = require('browserstack-webdriver'),
	testUtils = require('./testUtils.js');

module.exports = function(capabilities, options) {
	describe('Navigating to embed page url: ' + options.id, function() {
		this.timeout(4 * timeout);
		var driver, server = options.server,
			noop = function() {};

		it("embed script testing", function(done) {
			console.log("embed page testing");
			driver = testUtils.openUrl(capabilities, server,
				"s/test-embed.html?room=testroom1&minimize=false");
			setTimeout(function() {
				done();
				done = noop;
			}, 1.5 * timeout);
			driver.switchTo().frame(0). //if there is only one frame
			then(function() {
				driver.findElement(webdriver.By.css('.embed')).isDisplayed().
				then(function(t) {
					assert.equal(t, true, "page is not loaded");
					driver.quit();
					done();
				});
			});
		});

		it("embed script testing(minimized)", function(done) {
			console.log("minimized embed page testing");
			driver = testUtils.openUrl(capabilities, server,
				"s/test-embed.html?room=testroom1&minimize=true");
			setTimeout(function() {
				done();
				done = noop;
			}, 1.5 * timeout);
			driver.switchTo().frame(0).
			then(function() {
				driver.findElement(webdriver.By.css('.minimize-room-title')).isDisplayed().
				then(function(t) {
					assert.equal(t, true, "page is not loaded");
					driver.quit();
					done();
				});
			});
		});
	});
};