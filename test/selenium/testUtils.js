var webdriver = require('browserstack-webdriver');
module.exports.openUrl = openUrl;
module.exports.loginPersona = loginPersona;	
function openUrl(capabilities, server, roomid) {
	var driver = new webdriver.Builder().
	usingServer('http://hub.browserstack.com/wd/hub').
	withCapabilities(capabilities).
	build();
	driver.get(server + "/" + roomid);
	return driver;
}

function loginPersona(driver, id, password, callback) {
	driver.findElement(webdriver.By.css('.user-area')).click().
	then(function() {
		driver.findElement(webdriver.By.css('.persona')).click().then(function() {
			driver.getAllWindowHandles().then(function(win) {
				driver.switchTo().window(win[1]).then(function(){
					driver.findElement(webdriver.By.css(".isDesktopOrStart")).
					sendKeys(id).
					then(function() {
						driver.findElement(webdriver.By.css(".isDesktopOrStart")).
						sendKeys(webdriver.Key.RETURN).then(function() {
							setTimeout(function() {
								driver.findElement(webdriver.By.id("authentication_password")).
								sendKeys(password).then(function() { 
									driver.findElement(webdriver.By.id("authentication_password")).
									sendKeys(webdriver.Key.RETURN).then(function() {
										driver.switchTo().window(win[0]).then(callback);
									});
								});
							}, 7000);	
						});
					});							
				});
			});	
		});
	});
}