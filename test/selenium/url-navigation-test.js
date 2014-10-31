var webdriver = require('browserstack-webdriver'),
	config = require('../config.js'),
	testUtils = require('./testUtils.js'),
	assert = require('assert'),
	timeout = 25000;
module.exports = function(capabilities, options){
	describe('url navigatiion test'+ options.id, function(){
		this.timeout(4  * timeout);
		var driver, server = options.server;
		
		it("test for navigation to info page", function(done){
			this.timeout(4 * timeout);
			console.log("testing for info area");
			driver = testUtils.openUrl(capabilities, server, "room1?tab=info");
			driver.findElement(webdriver.By.css('.pane-info')).isDisplayed().
			then(function(t){
				assert.equal(t, true, "page loading failed");
				driver.quit();
				done()
			});
		});
		
		it("test for navigation to people page", function(done){
			this.timeout(4 * timeout);
			console.log("testing for people area");
			driver = testUtils.openUrl(capabilities, server, "room1?tab=people");
			driver.findElement(webdriver.By.css('.pane-people')).isDisplayed().
			then(function(t){
				assert.equal(t, true, "page loading failed");
				driver.quit();
				done()
			});
		});
		
		it("test for navigation to threads page", function(done){
			this.timeout(4 * timeout);
			console.log("testing for threads area");
			driver = testUtils.openUrl(capabilities, server, "room1?tab=threads");
			driver.findElement(webdriver.By.css('.pane-threads')).isDisplayed().
			then(function(t){
				assert.equal(t, true, "page loading failed");
				driver.quit();
				done();
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
			driver = testUtils.openUrl(capabilities, server, "room1/edit?tab="+item);
			driver.findElement(webdriver.By.css(classes[index])).isDisplayed().
			then(function(t){
				assert.equal(t, true, "page loading failed");
			});
			driver.quit().then(done);
			
		});*/
		
		it("test for navigation to /me page", function(done){
			this.timeout(4 * timeout);
			console.log("testing for /me area");
			driver = testUtils.openUrl(capabilities, server, "me");
			driver.findElement(webdriver.By.css('.js-area-home-feed')).isDisplayed().
			then(function(t){
				assert.equal(t, true, "page loading failed");
				driver.quit();
				done();
			});
		});
	});
};