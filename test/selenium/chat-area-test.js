var assert = require('assert'),
	fs = require('fs');
//npm install -g browserstack
var webdriver = require('browserstack-webdriver');
var test = require('browserstack-webdriver/testing');
var config = require("../config.js");
var timeout = 25000;
module.exports = function(capabilities, options) {
	test.describe('Chat Area Test: ' + options.id, function () {
		this.timeout(4 * timeout);
		var driver, server = "https://dev.scrollback.io";

		test.before(function () {
			this.timeout(3 * timeout);
			driver = new webdriver.Builder().
				usingServer('http://hub.browserstack.com/wd/hub').
				withCapabilities(capabilities).
				build();
			driver.get(server + '/scrollback');
			var time = new Date().getTime();
			driver.wait(function () {//wait for page load
				return new Date().getTime() - time >= 1.5 * timeout;
			}, 2 * timeout);
		});
		test.it("Message Load test", function () {
			this.timeout(timeout);
			driver.findElements(webdriver.By.css('.chat-item')).then(function (e) {
				console.log("Number of messages: ", e.length);
				assert.equal(true, e.length > 1, "No Messages displayed on load");
			});
		});

		test.it('Messages sending test', function () {
			this.timeout(timeout);
			driver.findElement(webdriver.By.css('.chat-entry')).
			then(function(searchBox) {
				var random = Math.random();
				searchBox.sendKeys('hello Testing message from script: ' + random);
				driver.findElement(webdriver.By.css('.chat-send')).click();

				driver.wait(function () {
					return driver.findElement(webdriver.By.css('.chat-area')).getText().then(function (text) {
						console.log("text", text);
						console.log("index=", text.indexOf("" + random));
						return text.indexOf("" + random) !== -1;
					});
				}, 2000);
			});
		});

		test.it("thread id test", function () {
			this.timeout(timeout);
			driver.findElements(webdriver.By.css('.chat-item')).then(function (e) {
				console.log("Number of messages: ", e.length);
				//check last message got thread-id
				e[e.length - 1].getAttribute("data-thread").then(function (threadId) {
					console.log("thread Id", threadId);
					assert.equal(33, threadId.length, "Last message did not got threadId");
				});
			});
		});


		test.after(function () {
			this.timeout(timeout);
			driver.quit();
		});
	});
}