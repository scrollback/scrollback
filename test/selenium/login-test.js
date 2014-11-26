var assert = require('assert'),
	timeout = 25000,
	config = require('../config.js'),
	webdriver = require('browserstack-webdriver'),
	testUtils = require('./testUtils.js');

module.exports = function(capabilities, options) {
	describe('Login Test: ' + options.id, function() {
		this.timeout(4 * timeout);
		var driver, server = options.server;

		before(function(done) {
			this.timeout(3 * timeout);
			driver = testUtils.openUrl(capabilities, server, "scrollback");
			setTimeout(done, 1.5 * timeout);
		});

		it("login using Persona", function(done) {
			console.log("persona login test");
			testUtils.loginPersona(driver, config.personaUser.email, config.personaUser.password,
				function() {
					setTimeout(function() {
						testUtils.getMyUserid(driver).then(function(t) {
							console.log("text: ", t);
							assert.equal(config.personaUser.username, t, "Login unsuccessful");
							done();
						});
					}, 5000);
				});
		});
		//logout test

		it("logout", function(done) {
			this.timeout(1.5 * timeout);
			console.log("logging out...");
			testUtils.logout(driver, function() {
				driver.findElement(webdriver.By.css('.sign-in')).isDisplayed().
				then(function(t) {
					assert.equal(t, true, "logout unsuccessful");
					done();
				});
			});
		});

		//facebook login test

		it("login using Facebook", function(done) {
			console.log("facebook login test");
			testUtils.loginFacebook(driver, config.facebookUser.email, config.facebookUser.password, function() {
				setTimeout(function() {
					testUtils.getMyUserid(driver).then(function(t) {
						console.log("text: ", t);
						assert.equal(config.facebookUser.username, t, "Login unsuccessful");
						testUtils.logout(driver, done);
					});
				}, 5000);
			});
		});

		it("login using Google", function(done) {
			console.log("google login test");
			testUtils.loginGoogle(driver, config.facebookUser.email, config.facebookUser.password,
				function() {
					setTimeout(function() {
						testUtils.getMyUserid(driver).then(function(t) {
							console.log("text: ", t);
							assert.equal(config.facebookUser.username, t, "Login unsuccessful");
							done();
						});
					}, 5000);
				});
		});

		after(function(done) {
			driver.quit().then(done);
		});
	});
};