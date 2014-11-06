var webdriver = require('browserstack-webdriver'),
	config = require('../config.js'),
	testUtils = require('./testUtils.js'),
	assert = require('assert'),
	q = require('q'),
	timeout = 25000;
module.exports = function(capabilities, options) {
	describe('url navigatiion test ' + options.id, function() {
		this.timeout(4 * timeout);
		var driver, server = options.server;

		before(function(done) {
			this.timeout(3 * timeout);
			driver = testUtils.openUrl(capabilities, server, "room1");
			setTimeout(done, 1.5 * timeout);
		});

		it("test for navigation to default edit page", function(done) {
			console.log("Default edit page");
			testUtils.loginPersona(driver, config.personaUser.email, config.personaUser.password,
				function() {
					setTimeout(function() {
						driver.get("https://stage.scrollback.io/room1/edit").
						then(function() {
							return q.delay(3000);
						}).
						then(function() {
							return driver.findElement(webdriver.By.css('.list-view-general-settings')).
							isDisplayed();
						}).then(function(t) {
							assert.equal(t, true, "page loading failed");
							done();
						});
					}, 5000);
				});
		});

		it("test for navigation to info page", function(done) {
			this.timeout(4 * timeout);
			console.log("testing for info area");
			driver.get("https://stage.scrollback.io/room1?tab=info").
			then(function() {
				return q.delay(3000);
			}).then(function() {
				driver.findElement(webdriver.By.css('.pane-info')).isDisplayed().
				then(function(t) {
					assert.equal(t, true, "page loading failed");
					done();
				});
			});
		});

		it("test for navigation to people page", function(done) {
			this.timeout(4 * timeout);
			console.log("testing for people area");
			driver.get("https://stage.scrollback.io/room1?tab=people").
			then(function() {
				return q.delay(3000);
			}).then(function() {
				driver.findElement(webdriver.By.css('.pane-people')).isDisplayed().
				then(function(t) {
					assert.equal(t, true, "page loading failed");

					done();
				});
			});
		});

		it("test for navigation to threads page", function(done) {
			this.timeout(4 * timeout);
			console.log("testing for threads area");
			driver.get("https://stage.scrollback.io/room1?tab=threads").
			then(function() {
				return q.delay(3000);
			}).then(function() {
				driver.findElement(webdriver.By.css('.pane-threads')).isDisplayed().
				then(function(t) {
					assert.equal(t, true, "page loading failed");

					done();
				});
			});
		});

		/*it("test for navigation to edit page", function(done) {
				this.timeout(4 * timeout);
				var items = Array("general", "irc", "twitter", "authorizer", "spam", "seo", "embed");
				var classes = [".list-view-general-settings", ".list-view-irc-settings",
						  "list-view-twitter-settings", ".list-view-authorizer-settings",
						  ".list-view-spam-settings", ".list-view-seo-settings",
						  ".list-item-embed-settings"];
				var index = Math.floor(Math.random() * items.length);
				var item = items[index];
				console.log("testing for edit", item);
				driver = testUtils.openUrl(capabilities, server, "room1/edit?tab=" + item);
				driver.findElement(webdriver.By.css(classes[index])).isDisplayed().
				then(function(t) {
					assert.equal(t, true, "page loading failed");
				});
				driver.quit().then(done);

			});*/

		it("test for navigation to home feed page", function(done) {
			this.timeout(4 * timeout);
			console.log("testing for home feed area");
			driver.get("https://stage.scrollback.io/me").
			then(function() {
				return q.delay(3000);
			}).then(function() {
				driver.findElement(webdriver.By.css('.js-area-home-feed-mine')).isDisplayed().
				then(function(t) {
					assert.equal(t, true, "page loading failed");

					done();
				});
			});
		});

		after(function(done) {
			driver.quit();
			done();
		});
	});
};