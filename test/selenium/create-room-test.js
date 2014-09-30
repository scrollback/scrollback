var assert = require('assert'),
	timeout = 35000,
	config = require('../config.js'),
	webdriver = require('browserstack-webdriver'),
	testUtils = require('./testUtils.js');

module.exports = function(capabilities, options) {
	describe('Create Room Test ' + options.id, function() {
		this.timeout(timeout);
		var driver, server = "https://dev.scrollback.io";
		var time = new Date().getTime();
		var roomName = "scrollback" + time;
		before(function(done) {
			this.timeout(3 * timeout);
			time = new Date().getTime();
			driver = testUtils.openUrl(capabilities, server, roomName);
			setTimeout(done, 1.5 * timeout);
		});

		it("login persona on create room view", function(done) { 
			console.log("login test");
			testUtils.loginPersona(driver, config.personaUser.email, config.personaUser.password, function() {
				setTimeout(function() {
					console.log("set Element");
					driver.findElement(webdriver.By.id("noroom-view-create")).click().then(function() {
						setTimeout(function() {
							driver.findElement(webdriver.By.css(".info-title")).getText().then(function(t) {
								assert.equal(t, roomName, "Room creation unseccessful");
								done();
							});
						}, 4000);
					});	
				}, 5000);
			});
		});



		after(function(done) {
			driver.quit().then(done);
		});
	});
};
