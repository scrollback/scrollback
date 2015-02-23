var assert = require('assert'),
	//npm install -g browserstack
	webdriver = require('browserstack-webdriver'),
	testUtils = require('./testUtils.js'),
	timeout = 25000;
module.exports = function(capabilities, options) {
	describe('Chat Area Test: ' + options.id, function() {
		this.timeout(2 * timeout);
		var driver, server = options.server;

		before(function(done) {
			this.timeout(3 * timeout);
			driver = testUtils.openUrl(capabilities, server, "scrollback");
			setTimeout(done, 1.5 * timeout);
		});

		it("Message Load test", function(done) {
			driver.findElements(webdriver.By.css('.chat-item')).then(function(e) {
				var c = 0;

				function d() {
					if (e.length === ++c) {
						done();
					}
				}
				e.forEach(function(el) {
					el.getAttribute("id").
					then(function(id) {
						d();
						assert.equal(true, id.length > 0, "ID Not added");
					});
				});
				console.log("Number of messages: ", e.length);
				assert.equal(true, e.length > 1, "No Messages displayed on load");
			});
		});

		it('Messages sending test( click chat-send button)', function(done) {
			var random;
			driver.findElement(webdriver.By.css('.chat-entry')).
			then(function(searchBox) {
				random = Math.random();
				searchBox.sendKeys('hello Testing message from script: ' + random);
				return driver.findElement(webdriver.By.css('.chat-send')).click();
			}).then(function() {
				driver.findElement(webdriver.By.css('.chat-area')).getText().
				then(function(text) {
					console.log("text", text);
					console.log("index=", text.indexOf("" + random));
					assert.notEqual(-1, text.indexOf("" + random), "Message sending failed");
					done();
				});
			});
		});

		it('Messages sending test(Press Enter Key)', function(done) {
			driver.findElement(webdriver.By.css('.chat-entry')).
			then(function(searchBox) {
				var random = Math.random();
				searchBox.sendKeys('hello Testing message from script: ' + random);
				searchBox.sendKeys(webdriver.Key.RETURN).then(function() {
					return driver.findElement(webdriver.By.css('.chat-area')).getText();
				}).then(function(text) {
					console.log("text", text);
					console.log("index=", text.indexOf("" + random));
					assert.notEqual(-1, text.indexOf("" + random), "Message sending failed");
					done();
				});
			});
		});

		it("thread id test", function(done) {
			driver.findElements(webdriver.By.css('.chat-item')).then(function(e) {
				console.log("Number of messages: ", e.length);
				//check last message got thread-id
				e[e.length - 1].getAttribute("data-thread").then(function(threadId) {
					console.log("thread Id", threadId);
					assert.equal(33, threadId.length, "Last message did not got threadId");
					done();
				});
			});
		});

		it("Scrolling test", function(done) {
			this.timeout(3 * timeout);
			var ids = [];
			driver.findElements(webdriver.By.css('.chat-item')).then(function(e) {
				e.forEach(function(el) {
					el.getAttribute("id").
					then(function(id) {
						ids.push(id);
						console.log("id..", id);
					});
				});
				console.log("Number of messages: ", e.length);
				assert.equal(true, e.length > 1, "No Messages displayed on load");
			});
			driver.executeScript("$(\".chat-item\")[0].scrollIntoView();");
			setTimeout(function() {
				driver.findElements(webdriver.By.css('.chat-item')).then(function(e) {
					var c = 0;

					function d() {
						if (e.length === ++c) {
							done();
						}
					}
					e.forEach(function(el) {
						el.getAttribute("id").
						then(function(id) {
							console.log("ID: ", id + "," + ids[c]);
							assert.equal(true, id.length > 0, "ID Not added");
							assert.notEqual(id, ids[c], "Not scrolling..");
							d();
						});
					});
					console.log("Number of messages: ", e.length);
					assert.equal(true, e.length > 1, "No Messages displayed on load");
				});
			}, 15000);
		});

		after(function(done) {
			this.timeout(timeout);
			driver.quit().then(done);
		});
	});
};