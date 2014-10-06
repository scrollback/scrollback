var webdriver = require('browserstack-webdriver');
module.exports.openUrl = openUrl;
module.exports.loginPersona = loginPersona;
var q = require('q');
function openUrl(capabilities, server, roomid) {
	var driver = new webdriver.Builder().
	usingServer('http://hub.browserstack.com/wd/hub').
	withCapabilities(capabilities).
	build();
	driver.get(server + "/" + roomid);
	return driver;
}

function loginPersona(driver, id, password, callback) {

	findVisibleElementByClass(driver, ".js-has-auth-menu", function (el) {
		var win;
		el.click().
		then(function () {
			return driver.findElement(webdriver.By.css('.persona')).click();
		}).then(function () {
			return driver.getAllWindowHandles();
		}).then(function (w) {
			win = w;
			return driver.switchTo().window(win[1]);
		}).then(function () {
			return q.delay(4000);
		}).then(function() {
			return driver.findElement(webdriver.By.css(".isDesktopOrStart")).sendKeys(id);
		}).then(function () {
			return driver.findElement(webdriver.By.css(".isDesktopOrStart"))
			.sendKeys(webdriver.Key.RETURN);
		}).then(function () {
			return q.delay(7000);
		}).then(function() {
			return driver.findElement(webdriver.By.id("authentication_password")).
			sendKeys(password);
		}).then(function () {
			return driver.findElement(webdriver.By.id("authentication_password")).
			sendKeys(webdriver.Key.RETURN);
		}).then(function () {
			driver.switchTo().window(win[0])
		}).then(function() {
			return q.delay(5000)
		}).then(callback);
	});
}

/**
 * Find one visible element by css
 */
function findVisibleElementByClass(driver, name, cb) {
	driver.findElements(webdriver.By.css(name)).
	then(function (el) {
		var element;
		var c = 0;
		function done() {
			if (++c === el.length) {
				cb(element);
			}
		}
		el.forEach(function (e) {
			e.isDisplayed().then(function (a) {
				if (a) {
					element = e;
				}
				done();
			});
		});

	});
}
