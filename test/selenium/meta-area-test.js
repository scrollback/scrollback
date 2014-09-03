var assert = require('assert'),
	webdriver = require('browserstack-webdriver'),
	timeout = 30000;
module.exports = function(capabilities, options) {
	describe('Meta area test: ' + options.id, function() {
		this.timeout(timeout);
		var driver, server = "http://dev.scrollback.io";
		before(function(done) {
			this.timeout(3 * timeout);
			driver = new webdriver.Builder().
			usingServer('http://hub.browserstack.com/wd/hub').
			withCapabilities(capabilities).
			build();
			driver.get(server + '/scrollback');
			setTimeout(done, 1.5 * timeout);
		});

		it("meta button test", function(done) {
			this.timeout(timeout);
			driver.findElement(webdriver.By.css('.meta-button-back')).
			then(function(mb) {
				mb.isDisplayed().
				then(function(v) {
					if (v) {
						mb.click().
						then(function() {
							driver.findElement(webdriver.By.css('.meta-area')).
							then(function(ma) {
								ma.isDisplayed().
								then(function(v) {
									assert.equal(true, v, "Meta-button-back is not working");
									done();
								});
							});
						});
					} else done();
				});
			});
		});

		it("People area test1", function(done) {
			this.timeout(timeout);
			driver.findElement(webdriver.By.css('.pane-people')).
				isDisplayed().
				then(function(v) {
					assert.equal(true, v, "people pane is not visible");
					done();
				});
			/*driver.findElement(webdriver.By.css('.pane-people')).getAttribute("class").then(function(cl) {
			 console.log("class: ", cl);
			 assert.equal(true, cl.indexOf("current") !== -1, "people pane is not visible");
			 });*/
		});

		it("People area test2", function(done) {
			this.timeout(timeout);
			driver.findElements(webdriver.By.css('.person')).then(function(ps) {
				console.log("Number of people", ps.length);
				assert.equal(true, ps.length > 1, "people area don't have online/offline users");
				done();
			});
		});

		it("config area test1", function(done) {
			this.timeout(timeout);
			driver.findElement(webdriver.By.css('.tab-info')).
				then(function(tab) {
					tab.click().
						then(function() {
							driver.findElement(webdriver.By.css('.pane-info')).
								then(function(el) {
									el.isDisplayed().
										then(function(v) {
											assert.equal(true, v, "Info area not visible after clicking info tab");
											done();
										});
								});
						});
				});
		});

		it("config area test2", function(done) {
			this.timeout(timeout);
			var c = 0;
			function d() {
				if (++c == 3) done();
			}
			driver.findElement(webdriver.By.css('.info-title')).
			then(function(el) {
				el.getText().then(function(t) {
					assert.equal(t, "scrollback", "showing incorrect room name");
					d();
				});
				el.isDisplayed().
				then(function(v) {
					assert.equal(true, v, "Room name not displayed");
					d();
				});
			});
			driver.findElement(webdriver.By.css('.info-description')).
			then(function(el) {
				el.isDisplayed().
				then(function(v) {
					assert.equal(true, v, "room description not displayed");
					d();
				});
			});

		});

		it("Thread area test1", function(done) {
			this.timeout(timeout);
			driver.findElement(webdriver.By.css('.tab-threads')).
			then(function(tab) {
				tab.click().
				then(function() {
					driver.findElement(webdriver.By.css('.pane-threads')).
					then(function(el) {
						el.isDisplayed().
						then(function(v) {
							assert.equal(true, v, "Thread area not visible after clicking threads tab");
							done();
						});
					});
				});
			});
		});

		it("Thread area test2", function(done) {
			this.timeout(timeout);
			driver.findElements(webdriver.By.css('.thread-item')).
			then(function(threads) {
				assert.equal(true, threads.length > 1, "No threads");
				done();
			});
		});

		it("select Thread", function(done) {
			this.timeout(timeout);
			driver.findElements(webdriver.By.css('.thread-item')).
			then(function(threads) {
				var index = Math.floor(Math.random() * threads.length - 1) + 1;
				threads[index].getAttribute('id').
				then(function(id) {
					id = id.substring(7);
					threads[index].click().
					then(function() {
						driver.findElements(webdriver.By.css('.chat-item')).
						then(function(messages) {
							messages.forEach(function(message) {
								message.getAttribute("data-thread").
								then(function(threadid) {
									console.log("threadID", threadid);
									assert.equal(threadid, id, "Thread Not loading");
									done();
								});
							});
						});
					});
				});
			});
		});

		after(function() {
			this.timeout(timeout);
			driver.quit();
		});
	});
};
