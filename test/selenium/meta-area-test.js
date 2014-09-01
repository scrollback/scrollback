var assert = require('assert');
//npm install -g browserstack
var webdriver = require('browserstack-webdriver');
var test = require('browserstack-webdriver/testing');
var config = require("../config.js");
var timeout = 30000;
test.describe('Scrollback test', function() {
	this.timeout(timeout);
	var driver, server = "http://dev.scrollback.io";

	test.before(function() {
		this.timeout(3 * timeout);
		var capabilities = {
			'browserstack.debug' : config.selenium.debug,
			'browserName' : 'chrome', 
			'browserstack.user' : config.selenium.username,
			'browserstack.key' : config.selenium.accessKey
		}
		driver = new webdriver.Builder().
		usingServer('http://hub.browserstack.com/wd/hub').
		withCapabilities(capabilities).
		build();
		driver.get(server + '/scrollback');
		var time = new Date().getTime();
		driver.wait(function() {//wait for page load
			return new Date().getTime() - time >= 1.5 * timeout;
		}, 2 * timeout);
	});
	test.it("People area test1", function() {
		this.timeout(timeout);
		driver.findElement(webdriver.By.css('.pane-people')).
		isDisplayed().
		then(function(v) {
			assert.equal(true, v, "people pane is not visible");
		});
		/*driver.findElement(webdriver.By.css('.pane-people')).getAttribute("class").then(function(cl) {
			console.log("class: ", cl);
			assert.equal(true, cl.indexOf("current") !== -1, "people pane is not visible");
		});*/
	});
	
	test.it("People area test2", function() {
		this.timeout(timeout);
		driver.findElements(webdriver.By.css('.person')).then(function(ps) {
			console.log("people", ps);
			assert.equal(true, ps.length > 1, "people area don't have online/offline users");
		});
	});
	
	test.it("config area test1", function() {
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
					}); 	
				});
			}); 
		});
	});

	test.it("config area test2", function() {
		this.timeout(timeout);
        driver.findElement(webdriver.By.css('.info-title')).
        then(function(el) {
            el.getText().then(function(t){
				assert.equal(t, "scrollback", "showing incorrect room name");
			});
            el.isDisplayed().
            then(function(v) {
                assert.equal(true, v, "Room name not displayed");
            });
        });
		driver.findElement(webdriver.By.css('.info-description')).
		then(function(el) {
			el.isDisplayed().
			then(function(v) {
				assert.equal(true, v, "room description not displayed");
			});
		});

	});

	
	test.after(function() { 
		this.timeout(timeout);
		driver.quit(); 
	});
});