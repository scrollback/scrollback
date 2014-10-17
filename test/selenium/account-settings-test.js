var webdriver = require('browserstack-webdriver'),
    assert = require('assert'),
    testUtils = require('./testUtils.js'),
    config = require('../config.js'),
    timeOut = 10000;
module.exports = function(capabilities, options){
    describe('Account settings test: '+ options.id, function(){
        this.timeout(4 * timeOut);
        var driver, server = options.server;
        var random = Math.random() + "";
        before(function(done){
            this.timeout(4*timeOut);
            driver = testUtils.openUrl(capabilities, server, "testroom1");    
            testUtils.loginPersona(driver, config.personaUser.email, config.personaUser.password, function(){
                console.log("logging in through Persona...");
                done();
            });
        });
        
        it("account settings test(profile & email)", function(done){
            this.timeout(4 * timeOut);
            console.log("testing for user area");
            
            driver.findElement(webdriver.By.css('.user-area')).click().
            then(function() {
                console.log("this is account settings");
                return driver.findElement(webdriver.By.css('.userpref')).click();
            }).then(function() {
                    return driver.findElement(webdriver.By.css('.list-item-profile-settings')).click();
            }).then(function(){
                return driver.findElement(webdriver.By.css('.settings-action'));
            }).then(function(searchBox){
                searchBox.sendKeys(random);
            }).then(function(){
                return driver.findElement(webdriver.By.css('.list-item-email-settings')).click();
            }).then(function() {
                return driver.findElement(webdriver.By.css('.radio-item')).click();
            }).then(function() {
                return driver.findElement(webdriver.By.css('.action-buttons')).click();
            }).then(function() {
                return driver.findElement(webdriver.By.css(".sb-user")).isDisplayed();
            }).then(function(t) {
                assert.equal(t, true, "saving unsuccessful");
                done();
            });
        });
        
        after(function(done){
            this.timeout(timeOut);
            driver.quit();
            done();
        });
    });
};