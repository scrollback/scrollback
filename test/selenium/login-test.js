var assert = require('assert'),
	timeout = 25000,
	config = require('../config.js'),
	webdriver = require('browserstack-webdriver'),
	testUtils = require('./testUtils.js');

module.exports = function(capabilities, options) {
	describe('Login Test: ' + options.id, function() {
		this.timeout(4 * timeout);
		var driver, server = "https://dev.scrollback.io";

		before(function(done) {
			this.timeout(3 * timeout);
			driver = testUtils.openUrl(capabilities, server, "scrollback");
			setTimeout(done, 1.5 * timeout);
		});
		
		it("login persona", function(done) { 
			console.log("login test");
			testUtils.loginPersona(driver, config.personaUser.email, config.personaUser.password, function() {
				setTimeout(function() {
					console.log("set Element");
					driver.findElement(webdriver.By.css(".sb-user")).getText().then(function(t) {
						console.log("text: ", t);
						assert.equal(config.personaUser.username, t, "Login unsuccessful");
						done();
					});	
				}, 5000);
			});
		});
		
		after(function(done) {
			driver.quit()
			done();
		});
	});
};
