// Selenium Installation: 
// npm install selenium-webdriver
var url = "http://hub.browserstack.com/wd/hub";
var webdriver = require('selenium-webdriver');
var assert = require("assert");

//Input capabilities
var caps = {
  "browser": "IE",
  "browser_version": "7.0",
  "os": "Windows",
  "os_version": "XP",
  "browserstack.debug": "true",
  'browserstack.user' : 'aravind20' , 
  'browserstack.key': 'bTU9MSGyu75LfjNfAHs5'
};

var driver = new webdriver.Builder().usingServer(url).withCapabilities(caps).build();

driver.get('http://www.google.com');
driver.findElement(webdriver.By.name('q')).sendKeys('browserstack');
driver.findElement(webdriver.By.name('btnG')).click();
driver.getTitle().then(function(title) {
    assert.equal(title, 'browserstack - Google Search');
});

driver.quit();